const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const jsonc = require("jsonc-parser");

const Settings = require("./settingsManager");
const StatusBars = require("./statusBarManager");
const When = require("./whenManager");

const keybindingsFolder = getPathToKeybindingsFolder();
const keybindingsPath = path.join(keybindingsFolder, "keybindings.json");
const backupPath = keybindingsPath + ".backup";

/**
 * Function to determine if the extension is running in VSCodium or VS Code.
 * @returns {boolean} true if running in VSCodium, false if running in VS Code.
 */
function getPathToKeybindingsFolder() {
  const baseFolder = Settings.isVSCodium ? "VSCodium" : "Code"; // change directory name based on application

  switch (Settings.platform) {
    case "darwin": // macOS
      return path.join(
        os.homedir(),
        "Library",
        "Application Support",
        baseFolder,
        "User"
        // "keybindings.json"
      );
    case "win32": // Windows
      return path.join(
        process.env.APPDATA || "",
        baseFolder,
        "User"
        // "keybindings.json"
      );
    case "linux": // Linux
      return path.join(
        os.homedir(),
        ".config",
        baseFolder,
        "User"
        // "keybindings.json"
      );
    default:
      // |-----------------------|
      // |        feature        |
      // |-----------------------|
      // add setting for user to provide path to keybindings.json

      throw new Error(`Unsupported platform: ${Settings.platform}`);
  }
}

let keybindingsCache = {
//   "allKeybindings": [
//      ...keybindings.json,
//    ],
//   "pages": [
//      ...all page keybindings,
//    ],
//   "pageSpells": {
//      "Editor_Spells": [
//          ...editor spells,
//       ],
//       "Comment_Spells": [
//          ...comment spells,
//       ],
//    },
//    ...
};

function updateKeybindingsCache() {
  StatusBars.saving.initialize().show();
  const allKeybindings = getKeybindingsFromJson();

  const pageKeybindings = keybindingForEachPage(allKeybindings);

  const pageSpells = {};
  pageKeybindings.forEach((pageKeybinding) => {
    const mapPage =
      pageKeybinding.args.mapPage || pageKeybinding.args.args.mapPage;
    const whenContext = When.serializer(mapPage);
    pageSpells[whenContext] = [
      ...allSpellKeybindingsForPage(allKeybindings, whenContext),
    ];
  });

  keybindingsCache.allKeybindings = allKeybindings;
  keybindingsCache.pages = pageKeybindings;
  keybindingsCache.pageSpells = pageSpells;
}

let timeout;

function initialize(context) {
  updateKeybindingsCache();

  // |-----------------------|
  // |        Watcher        |
  // |-----------------------|
  const keybindingsUri = vscode.Uri.file(keybindingsFolder);
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(keybindingsUri, "keybindings.json")
  );

  function debounceUpdate() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      updateKeybindingsCache();
    }, 1000);
  }
  watcher.onDidChange(debounceUpdate);
  watcher.onDidCreate(debounceUpdate);
  watcher.onDidDelete(() => {
    getKeybindingsFromJson();
    debounceUpdate();
  });
  context.subscriptions.push(watcher);
}

/**
 * Function to get all keybindings from keybindings.json
 * @returns {array} - a array of all keybindings.
 */
function getKeybindings() {
  let allKeybindings = keybindingsCache.allKeybindings;
  if (!allKeybindings) {
    allKeybindings = getKeybindingsFromJson();
  }
  return allKeybindings;
}

function getKeybindingsFromJson() {
  let currentContent = "[]"; // Default empty array content if file does not exist
  try {
    if (fs.existsSync(keybindingsPath)) {
      // Read the current content of the keybindings file if it exists
      currentContent = fs.readFileSync(keybindingsPath, "utf8");
    } else {
      fs.writeFileSync(keybindingsPath, currentContent, "utf8");
    }

    const keybindings = jsonc.parse(currentContent);
    return keybindings;
  } catch (error) {
    vscode.window.showErrorMessage("Could not parse keybindings.json");
    console.error("Error reading keybindings.json:", error);
    return [];
  }
}

function getKeybindingForPage(mapPage) {

  let pages = keybindingsCache.pages;
  if (!pages) {
    pages = getKeybindingForPage(getKeybindings());
  }

  const [keybinding] = pages.filter(
    (kb) =>
      (kb.args && kb.args.mapPage === mapPage) ||
      (kb.args && kb.args.args && kb.args.args.mapPage === mapPage)
  );

  return keybinding;
}

function getSpellKeybindingsForPage(mapPage) {

  const whenContext = When.serializer(mapPage);

  let spellKeybindingsForPage = keybindingsCache.pageSpells[whenContext];
  if (!spellKeybindingsForPage) {
    spellKeybindingsForPage = allSpellKeybindingsForPage(
      getKeybindings(),
      whenContext
    );
  }
  return spellKeybindingsForPage;
}

/**
 * Function to filter an array of keybindings by the provided mapPage
 * @param {array} keybindings an array of keybindings
 * @param {string} whenContext the value to filter the keybindings by
 * @returns {array} the filtered keybindings
 */
function allSpellKeybindingsForPage(keybindings, whenContext) {
  return keybindings.filter((kb) => {
    const whenClause = kb.when;
    return whenClause && (whenClause === whenContext || whenClause.split("||")[0].trim() == whenContext);
  });
}

function getPreviousPage(mapPage) {
  return keybindingsCache.nestedPages[When.serializer(mapPage)]?.previousPage
}

function getAllPages() {
  let allPages = keybindingsCache.pages;
  if (!allPages) {
    allPages = keybindingForEachPage(getKeybindings());
  }
  return allPages;
}

function keybindingForEachPage(keybindings) {
  // this function ensures only unique values, and
  // if a map page has a base keybinding and a nested keybinding
  // it returns the base keybinding, which may be different


  // |---------------------|
  // |        *BUG*        |
  // |---------------------|

  // this function is not maintaining the order of the keybindings
  // which is breaking the ordering feature for pages


  const uniqueMapPages = new Set();
  const mapPagesKeybindings = {};
  const nestedMapPagesKeybindings = {};

  keybindings.forEach((keybinding) => {
    if (
      keybinding.command === Settings.keys.commands.openMapPage &&
      keybinding.args !== undefined
    ) {
      //   Page keybinding
      // -------------------

      const mapPage = When.serializer(keybinding.args.mapPage);
      if (mapPage) {
        uniqueMapPages.add(mapPage);
        mapPagesKeybindings[mapPage] = keybinding;
      }
    } else if (
      keybinding.command === Settings.keys.commands.closeMap &&
      keybinding.args !== undefined &&
      keybinding.args.command === Settings.keys.commands.openMapPage
    ) {
      //   Nested Page Keybinding
      // --------------------------

      const nestedArgs = keybinding.args.args;
      if (nestedArgs && nestedArgs.mapPage) {
        const mapPage = When.serializer(nestedArgs.mapPage);
        uniqueMapPages.add(mapPage);
        nestedMapPagesKeybindings[mapPage] = {...keybinding, previousPage: keybinding.when.split("||")[0].trim().split(".")[1]};
      }
    }
  });

  keybindingsCache.nestedPages = nestedMapPagesKeybindings
  return Array.from(uniqueMapPages).map((page) => {
    return mapPagesKeybindings.hasOwnProperty(page)
    //   return page keybindings before nested page keybindings
    // ----------------------------------------------------------
      ? mapPagesKeybindings[page]
      : nestedMapPagesKeybindings[page];
  });
}

/**
 * Function to write new keybindings to the keybindings.json file with a backup and preserve comments.
 * @param {Array<Object>} newKeybindings - The list of new keybinding objects to add or update.
 */
function saveKeybindings(newKeybindings) {
  return new Promise((resolve, reject) => {
    try {
      // Default empty array content if file does not exist
      let currentContent = "[]";

      if (fs.existsSync(keybindingsPath)) {
        // Read the current content of the keybindings file if it exists
        currentContent = fs.readFileSync(keybindingsPath, "utf8");

        // Backup the current keybindings.json
        fs.writeFileSync(backupPath, currentContent);
      } else {
        // Create an empty keybindings.json file with an empty array if it doesn't exist
        fs.writeFileSync(keybindingsPath, currentContent, "utf8");
      }

      let currentKeybindings = jsonc.parse(currentContent) || [];

      newKeybindings.forEach((newKeybinding) => {
        // Find if the keybinding already exists
        const existingIndex = currentKeybindings.findIndex(
          (kb) =>
            kb.when &&
            kb.when === newKeybinding.when &&
            kb.key === newKeybinding.key &&
            kb.args &&
            kb.args.command === newKeybinding.args.command &&
            kb.args.label === newKeybinding.args.label &&
            kb.args.mapPage === newKeybinding.args.mapPage
        );

        if (existingIndex !== -1) {
          //  delete current keybinding
          const edits = jsonc.modify(
            currentContent,
            [existingIndex],
            undefined, // undefined removes the item
            { formattingOptions: { insertSpaces: true, tabSize: 2 } }
          );
          currentContent = jsonc.applyEdits(currentContent, edits);
          currentKeybindings.splice(existingIndex, 1);
        }
      });

      newKeybindings.forEach((newKeybinding, index) => {
        // Add keybinding
        const edits = jsonc.modify(
          currentContent,
          [currentKeybindings.length + index],
          newKeybinding,
          { formattingOptions: { insertSpaces: true, tabSize: 2 } }
        );

        currentContent = jsonc.applyEdits(currentContent, edits);
      });

      // Write the updated content back to keybindings.json
      fs.writeFileSync(keybindingsPath, currentContent, "utf8");

      resolve(true)

    } catch (error) {

      // |-------------------|
      // |        BUG        |
      // |-------------------|
      /*
      This does not seem to catch when there are problems in keybindings.json
      i am able to write keybindings even when the json is broken.
      probably need to do some error handling to figure out if this is even working.
      */

      console.error("Error writing to keybindings.json:", error);
      reject(error)
    }
  })
}

/**
 * Function to write new keybindings to the keybindings.json file with a backup and preserve comments.
 * @param {Array<Object>} keybindingToRemove - The list of new keybinding objects to add or update.
 */
function removeKeybinding(keybindingToRemove) {
  try {
    // Default empty array content if file does not exist
    let currentContent = "[]";

    if (fs.existsSync(keybindingsPath)) {
      // Read the current content of the keybindings file if it exists
      currentContent = fs.readFileSync(keybindingsPath, "utf8");

      // Backup the current keybindings.json
      fs.writeFileSync(backupPath, currentContent);
    } else {
      // Create an empty keybindings.json file with an empty array if it doesn't exist
      fs.writeFileSync(keybindingsPath, currentContent, "utf8");
    }

    let currentKeybindings = jsonc.parse(currentContent) || [];

    const existingIndex = currentKeybindings.findIndex(
      (kb) =>
        kb.when &&
        kb.when === keybindingToRemove.when &&
        kb.key === keybindingToRemove.key &&
        kb.args &&
        kb.args.command === keybindingToRemove.args.command &&
        kb.args.label === keybindingToRemove.args.label &&
        kb.args.mapPage === keybindingToRemove.args.mapPage
    );

    if (existingIndex !== -1) {
      //  delete current keybinding
      const edits = jsonc.modify(
        currentContent,
        [existingIndex],
        undefined, // undefined removes the item
        { formattingOptions: { insertSpaces: true, tabSize: 2 } }
      );
      currentContent = jsonc.applyEdits(currentContent, edits);
    }

    // Write the updated content back to keybindings.json
    fs.writeFileSync(keybindingsPath, currentContent, "utf8");

  } catch (error) {
    console.error("Error writing to keybindings.json:", error);
  }
}

/**
 * Function to open the keybindings.json file and reveal a specific keybinding by command.
 * @param {string} command - The command associated with the keybinding to find.
 */
async function revealKeybinding(keybinding) {
  // Open the keybindings.json file
  await vscode.commands.executeCommand(
    "workbench.action.openGlobalKeybindingsFile"
  );

  // Get the active text editor (which should be keybindings.json)
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    // Read the entire content of the keybindings.json file
    const document = editor.document;
    const text = document.getText();

    try {
      // Parse the JSONC content into an array of objects and get the JSON node tree
      const rootNode = jsonc.parseTree(text);

      if (rootNode) {
        // Iterate through child nodes to find a matching keybinding
        for (const node of rootNode.children) {
          const parsedKeybinding = jsonc.getNodeValue(node);
          if (
            parsedKeybinding &&
            parsedKeybinding.key === keybinding.key &&
            parsedKeybinding.command === keybinding.command &&
            JSON.stringify(parsedKeybinding.args) ===
              JSON.stringify(keybinding.args)
          ) {
            // Get the start position of the node
            const startPosition = document.positionAt(node.offset);

            // Reveal and highlight the line in the editor
            editor.revealRange(
              new vscode.Range(startPosition, startPosition),
              vscode.TextEditorRevealType.AtTop
            );
            editor.selection = new vscode.Selection(
              startPosition,
              startPosition
            );
            return;
          }
        }

        vscode.window.showInformationMessage(`Keybinding not found.`);
      } else {
        vscode.window.showErrorMessage(
          "Failed to parse the keybindings.json file."
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        "Failed to parse keybindings.json: " + error.message
      );
    }
  }
}

module.exports = {
  initialize,
  getKeybindingForPage,
  getSpellKeybindingsForPage,
  getAllPages,
  getPreviousPage,
  saveKeybindings,
  removeKeybinding,
  revealKeybinding,
};
