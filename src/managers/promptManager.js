const vscode = require("vscode");
const settings = require("../managers/settingsManager");
const keybindingsMgr = require("../managers/keybindingsManager");


const whenMgr = require("../managers/whenManager");


/**
 * Function to prompt the user to enter a command.
 * @returns {Promise<string | undefined>} The provided command or undefined if canceled.
 */
async function promptUserForCommand() {
  const configs = settings.useConfigs();
  const inputBoxTitle = configs.get(settings.keys.displayMapTitle)
    ? configs.get(settings.keys.inputBoxTitle)
    : "";

  let availableCommands = await vscode.commands.getCommands(true);
  availableCommands = availableCommands.map((cmd) => ({
    label: `${configs.get(settings.keys.spellIcon)} ${cmd}`,
    command: cmd,
  }));

  const addCustomCommand = {
    label: "$(pencil) Enter a custom command ...",
    alwaysShow: true,
  };

  const goToAnotherPage = {
    label: `${configs.get(settings.keys.subpageIcon)} Go to another Page ...`,
    command: settings.keys.commands.openMap,
    // alwaysShow: true,
  };

  const addSeparator = {
    label: "$(add) Add a Separator",
    command: "separator",
  };

  const sep = {
    kind: vscode.QuickPickItemKind.Separator,
    label: "commands",
  };

  const options = [
    addCustomCommand,
    goToAnotherPage,
    addSeparator,
    sep,
    ...availableCommands,
  ];
  const selectedOption = await vscode.window.showQuickPick(options, {
    title: inputBoxTitle,
    placeHolder: "Choose a command ...",
  });

  if (!selectedOption) {
    return undefined;
  }

  if (selectedOption.label === addCustomCommand.label) {
    // user wants to type in a custom command name
    selectedOption.command = await vscode.window.showInputBox({
      title: inputBoxTitle,
      placeHolder: "editor.action.blockComment",
      prompt: "A Command ... ",
      validateInput: (text) =>
        text.trim() === "" ? "Command cannot be empty" : null,
    });
  }

  return selectedOption.command.trim();
}

/**
 * Function to prompt the user to enter a keybinding.
 * @returns {Promise<string | undefined>} The provided keybinding or undefined if canceled.
 */
async function promptUserForKey() {
  const configs = settings.useConfigs();
  const inputBoxTitle = configs.get(settings.keys.displayMapTitle)
    ? configs.get(settings.keys.inputBoxTitle)
    : "";

  return await vscode.window.showInputBox({
    title: inputBoxTitle,
    placeHolder: "ctrl+shift+r or cmd+l",
    prompt: "A keybinding ... ",
    validateInput: (text) => {
      // test to see if the provided input is a keybinding
      return null; // Return null if the input is valid
    },
  });
}

/**
 * Function to prompt the user to enter a label.
 * @returns {Promise<string | undefined>} The provided label or undefined if canceled.
 */
async function promptUserForLabel(selectedCommand, selectedKey) {
  // |----------------------|
  // |        Update        |
  // |----------------------|

  // this command needs to be used for creating a separator as well
  // change the placeholder based on the command value?

  const configs = settings.useConfigs();
  const inputBoxTitle = configs.get(settings.keys.displayMapTitle)
    ? configs.get(settings.keys.inputBoxTitle)
    : "";
  const placeHolder =
    selectedCommand === "separator"
      ? "Provide a label for the separator (may be blank)"
      : `Or leave blank for default: ${selectedCommand} (${settings.prettifyKey(
          selectedKey
        )})`;

  return await vscode.window.showInputBox({
    title: inputBoxTitle,
    placeHolder: placeHolder,
    prompt: "A Label ...",
    validateInput: (text) => {
      // test to see if the provided input is a keybinding
      return null; // Return null if the input is valid
    },
  });
}

/**
 * Function to prompt the user to enter a name for a new Page.
 * @returns {Promise<string | undefined>} The provided name or undefined if canceled.
 */
async function promptUserForName(userInput = "") {
  const configs = settings.useConfigs();
  const inputBoxTitle = configs.get(settings.keys.displayMapTitle)
    ? configs.get(settings.keys.inputBoxTitle)
    : "";

  return await vscode.window.showInputBox({
    title: inputBoxTitle,
    placeHolder: "The Room of Requirement",
    value: userInput, // Pre-fill with the captured user input
    prompt: "A Name ...",
    validateInput: (text) =>
      text.trim() === "" ? "Command cannot be empty" : null,
  });
}

let pagePrompt;
/**
 * Function to prompt the user to select a Page
 * @returns {Promise<string | undefined>} The provided page name or undefined if canceled.
 */
async function promptUserForPage({ isNestedPage=false }={}) {

  const configs = settings.useConfigs();
  const { setGetMapPageContext, removeGetMapPageContext} = whenMgr.useGetMapPageContext();

  //   Create
  // ----------
  pagePrompt = vscode.window.createQuickPick();
  setGetMapPageContext();

  //   Decorate
  // ------------
  const displayTitle = configs.get(settings.keys.displayMapTitle);
  if (displayTitle) {
    pagePrompt.title = `${configs.get(settings.keys.titleIcon)}`;
  }
  pagePrompt.placeholder = "Select a page ...";
  pagePrompt.onDidTriggerItemButton((event) => {event.button.trigger()});
  let userInput = "";
  pagePrompt.onDidChangeValue((value) => {
    userInput = value;
  });

  //   Add Items
  // -------------
  const allPages = keybindingsMgr.getAllPages();
  const convertedItems = keybindingsMgr.convertToItems(allPages);
  const addPageItem = {
    label: "$(add) New Page",
    alwaysShow: true,
  };
  pagePrompt.items = [
    ...convertedItems,
    {
      kind: vscode.QuickPickItemKind.Separator,
    },
    addPageItem,
  ];

  return new Promise((resolve) => {
    pagePrompt.onDidHide(() => {
      pagePrompt.dispose();
      removeGetMapPageContext();
      resolve(undefined);
    });
    pagePrompt.onDidAccept(async () => {
      pagePrompt.hide();

      const [selectedOption] = pagePrompt.selectedItems;
      if (selectedOption.label === addPageItem.label) {
        // Selected to create a new page
        if (isNestedPage) {
          resolve(
            // the new name for the page
            new Promise(async (resolve) => {
              resolve(await promptUserForName(userInput));
            })
          );
        } else {
          // is not a nested page
          resolve(
            // the new name for the page after creation
            new Promise(async (resolve) => {
              resolve(await createNewMapPage(userInput));
            })
            // |------------------------------------|
            // |        What a ClusterFuck!+        |
            // |------------------------------------|
          );
        }
      } else {
        //   Selected a pre-existing page
        resolve(selectedOption.mapPage);
      }
      pagePrompt.dispose();
    });
    pagePrompt.show();
  });
}

function clean() {
  if (pagePrompt) {
    pagePrompt.hide();
  }
}

function usePagePrompt() {
  if (pagePrompt){
    return pagePrompt;
  }
}

/**
 * Function to create a new page on the map
 * @param {string} mapPage the name of the page to be created
 * @param {string} selectedKey the keybinding for the new page
 * @returns {Promise<string | undefined>} the name of the Map Page that was created, or undefined if canceled.
 */
async function createNewMapPage(userInput) {
  const mapPage = await promptUserForName(userInput);
  if (mapPage === undefined) {
    return undefined; // exit on 'Esc' key
  }
  const selectedKey = await promptUserForKey();
  if (selectedKey === undefined) {
    return undefined; // exit on 'Esc' key
  }

  if (mapPage && selectedKey) {
    const keybinding = {
      key: selectedKey,
      command: settings.keys.commands.openMap,
      when: `!${settings.keys.mapOpenContext}`,
      args: {
        mapPage,
      },
    };
    keybindingsMgr.saveKeybinding(keybinding);
    return mapPage;
  }
  return undefined; // exit
}

module.exports = {
  promptUserForCommand,
  promptUserForKey,
  promptUserForLabel,
  promptUserForName,
  promptUserForPage,
  clean,
  usePagePrompt,
};
