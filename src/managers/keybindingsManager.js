const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const jsonc = require("jsonc-parser");

const settings = require("./settingsManager");

const platform = os.platform();
const isVSCodium = vscode.env.appName.includes("VSCodium");

/**
 * Function to determine if the extension is running in VSCodium or VS Code.
 * @returns {boolean} true if running in VSCodium, false if running in VS Code.
 */
function getPathToKeybindingsFile() {
    const baseFolder = isVSCodium ? "VSCodium" : "Code"; // change directory name based on application

    // console.log('---------------');
    // console.log('platform',platform);
    // console.log('isVSCodium',isVSCodium());
    // console.log('baseFolder',baseFolder);

    switch (platform) {
        case "darwin": // macOS
            return path.join(
                os.homedir(),
                "Library",
                "Application Support",
                baseFolder,
                "User",
                "keybindings.json"
            );
        case "win32": // Windows
            return path.join(
                process.env.APPDATA || "",
                baseFolder,
                "User",
                "keybindings.json"
            );
        case "linux": // Linux
            return path.join(
                os.homedir(),
                ".config",
                baseFolder,
                "User",
                "keybindings.json"
            );
        default:
            // |-----------------------|
            // |        feature        |
            // |-----------------------|
            // add setting for user to provide path to keybindings.json

            throw new Error(`Unsupported platform: ${platform}`);
    }
}

/**
 * Function to get all keybindings from keybindings.json
 * @returns {array} - a array of all keybindings.
 */
function getKeybindings() {
    try {
        const data = fs.readFileSync(getPathToKeybindingsFile(), "utf8");
        const keybindings = jsonc.parse(data);
        return keybindings;
    } catch (error) {
        vscode.window.showErrorMessage("Could not parse keybindings.json");
        console.error("Error reading keybindings.json:", error);
        return [];
    }
}

/**
 * Function to filter an array of keybindings by the provided mapPage
 * @param {array} keybindings an array of keybindings parsed from keybindings.json
 * @param {string} mapPage the value to filter the keybindings by
 * @returns {array} the filtered keybindings
 */
function getKeybindingsForPage(whenContext) {
    return getKeybindings().filter((kb) => {
        const whenClause = kb.when;
        return whenClause && whenClause === whenContext;
    });
}

/**
 * Function to gather all mapPages created by the user
 * @param {array} keybindings an array of keybindings parsed from keybindings.json
 * @returns {array} - A list of map pages.
 */
function getAllPages() {
    // this function ensures only unique values, and
    // if a map page has a base keybinding and a nested keybinding
    // it returns the base keybinding, which may be different

    const uniqueMapPages = new Set();
    const mapPagesKeybindings = {};
    const nestedMapPagesKeybindings = {};

    getKeybindings().forEach((keybinding) => {
        if (
            keybinding.command === settings.keys.commands.openMap &&
            keybinding.args !== undefined
        ) {
            //   Page keybinding
            // -------------------

            const mapPage = keybinding.args.mapPage;
            if (mapPage) {
                uniqueMapPages.add(mapPage);
                mapPagesKeybindings[mapPage] = keybinding;
            }
        } else if (
            keybinding.command === settings.keys.commands.closeMap &&
            keybinding.args !== undefined &&
            keybinding.args.command === settings.keys.commands.openMap
        ) {
            //   Nested Page Keybinding
            // --------------------------

            const nestedArgs = keybinding.args.args;
            if (nestedArgs && nestedArgs.mapPage) {
                const mapPage = nestedArgs.mapPage;
                uniqueMapPages.add(mapPage);
                nestedMapPagesKeybindings[mapPage] = keybinding;
            }
        }
    });

    return Array.from(uniqueMapPages).map((page) => {
        //
        return mapPagesKeybindings.hasOwnProperty(page)
            ? //   return page keybindings before nested page keybindings
              // ----------------------------------------------------------
              mapPagesKeybindings[page]
            : nestedMapPagesKeybindings[page];
    });
}

/**
 * Function to take a json keybinding code and return a human friendly display version
 * @param {string} keyCode the json keybinding.key
 * @returns {string} the prettified keyCode
 */
function prettifyKey(keyCode) {
    //  "cmd+alt+e" => "⌘⌥E"
    return `(${keyCode})`
        .toUpperCase()
        .replaceAll("+", "")
        .replace("CMD", "⌘")
        .replace("ALT", "⌥")
        .replace("CTRL", "^")
        .replace("SHIFT", "⇧");
}

function convertToItems(keybindings) {
    const configs = settings.useConfigs();

    const spellsTable = keybindings
        .map(convertKeybinding)
        .reduce(sortItems, {
            pages: [],
            spells: [],
            orderedSpells: [],
        });

    const spells = spellsTable.pages.concat(spellsTable.spells);
    //   place any spells with an "order" property at their specified index
    // ----------------------------------------------------------------------
    spellsTable.orderedSpells
        .sort((a, b) => a.order - b.order) // put them in order
        .forEach((spell) => {
            spells.splice(spell.order, 0, spell); // add them to the list
        });
    return spells;

    function sortItems(itemsTable, item) {
        const { pages, spells, orderedSpells } = itemsTable;
        const isOrdered = "order" in item;
        const isPage = item.command === settings.keys.commands.openMap;
        if (isOrdered) {
            orderedSpells.push(item);
        } else if (isPage) {
            pages.push(item);
        } else {
            spells.push(item);
        }
        return itemsTable;
    }

    function convertKeybinding(keybinding) {
        const args = keybinding.args;
        let label;
        let description;

        if (keybinding.command === settings.keys.commands.closeMap) {
            //   Keybinding is a Spell on a Page
            // -----------------------------------

            if (args.command === settings.keys.commands.openMap) {
                //   Keybinding is a nested Page
                // -------------------------------

                label = `   ${configs.get(settings.keys.subpageIcon)} Go to ${
                    args.args.mapPage
                } ...`;
                description = `${prettifyKey(keybinding.key)}`;

            } else if(args.separator){
                //   keybinding is a separator
                // -----------------------------
                
                label = args.label
                args.kind = vscode.QuickPickItemKind.Separator
            } else {
                //   keybinding is a spell
                // -------------------------

                label = `${configs.get(settings.keys.spellIcon)} ${
                    args.label ? args.label : args.command
                }`;
                description = `${prettifyKey(keybinding.key)}  ${
                    // if displayCommandId and there is a label
                    configs.get(settings.keys.displayCommandId) && args.label
                        ? // show the command id
                          args.command
                        : ""
                }`;
            }
        } else if (keybinding.command === settings.keys.commands.openMap) {
            //   keybinding is a page
            // ------------------------

            label = `${configs.get(settings.keys.pageIcon)} ${args.mapPage}`;
            description = prettifyKey(keybinding.key);
        }

        const buttons = [settings.buttons.edit];

        return {
            ...keybinding.args,
            label,
            description,
            buttons,
            keybinding,
        };
    }
}

/**
 * Function to write a new keybinding to the keybindings.json file with a backup and preserve comments.
 * @param {Object} newKeybinding - The new keybinding object to add.
 */
function saveKeybinding(newKeybinding) {
    // |---------------------|
    // |        *BUG*        |
    // |---------------------|

    // if keybindings.json does not exist it does not get or save any new keybindings

    const keybindingsPath = getPathToKeybindingsFile();
    const backupPath = keybindingsPath + ".backup";

    try {
        const currentContent = fs.readFileSync(keybindingsPath, "utf8");
        fs.writeFileSync(backupPath, currentContent);

        // Parse the JSONC content preserving comments
        const currentKeybindings = jsonc.parse(currentContent) || [];
        const edits = jsonc.modify(
            currentContent,
            [currentKeybindings.length],
            newKeybinding,
            { formattingOptions: { insertSpaces: true, tabSize: 2 } }
        );

        // Apply the edits to the original content to get the new content with the comment preserved
        const newContent = jsonc.applyEdits(currentContent, edits);

        // Write the updated content back to keybindings.json
        fs.writeFileSync(keybindingsPath, newContent, "utf8");
    } catch (error) {
        console.error("Error writing to keybindings.json:", error);
    }
}

// |-----------------------|
// |        Feature        |
// |-----------------------|

// update keybinding function?

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
    getKeybindingsForPage,
    getAllPages,
    convertToItems,
    prettifyKey,
    saveKeybinding,
    revealKeybinding,
    platform,
};
