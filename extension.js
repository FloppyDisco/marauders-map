const vscode = require("vscode");
const { maraudersMapPrefix, COMMANDS, SETTINGS } = require("./src/constants");
const { getDefaultMapDelay } = require("./src/managers/settingsManager");
const {
    setWhenContext,
    removeWhenContext,
} = require("./src/managers/whenManager");
const {
    getKeybindings,
    getSpellsForPage,
} = require("./src/managers/keybindingsManager");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const extensionStatusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        0
    );
    extensionStatusBar.text = SETTINGS.mapIcon;
    extensionStatusBar.command = COMMANDS.startSpell;
    extensionStatusBar.show();

    let maraudersMap;
    let pageStatusBar;
    let whenContext;

    context.subscriptions.push(
        // |--------------------------------------------------------|
        // |        I_Solemnly_Swear_That_I_Am_Up_To_No_Good        |
        // |--------------------------------------------------------|

        vscode.commands.registerCommand(
            COMMANDS.startSpell,
            ({ mapPage, mapDelay } = {}) => {
                whenContext = `${maraudersMapPrefix}.${mapPage}`;
                setWhenContext(whenContext);

                const keybindings = getKeybindings();

                pageStatusBar = vscode.window.createStatusBarItem(
                    vscode.StatusBarAlignment.Left,
                    0
                );
                pageStatusBar.text = `The Marauders Map ${SETTINGS.mapIcon}: ${mapPage}`;
                pageStatusBar.command = COMMANDS.displayMap;
                pageStatusBar.show();

                maraudersMap = vscode.window.createQuickPick();
                maraudersMap.title = `The Marauder's Map ${SETTINGS.mapIcon}`;
                maraudersMap.placeholder = "Choose your spell...";

                maraudersMap.items = [
                    {
                        label: "+ Add a Spell",
                        command: COMMANDS.saveSpell,
                        args: { mapPage },
                    },
                    ...getSpellsForPage(keybindings, mapPage),
                ];

                maraudersMap.onDidHide(() => {
                    // these MUST be called directly in function
                    removeWhenContext(whenContext); // cancel the when context for this page of the map
                    maraudersMap.dispose();
                    pageStatusBar.dispose();
                });

                maraudersMap.onDidChangeSelection(([selection]) => {
                    // these MUST be called directly in function
                    removeWhenContext(whenContext);
                    maraudersMap.dispose();
                    pageStatusBar.dispose();

                    vscode.commands.executeCommand(
                        selection.command,
                        selection.args
                    );
                });

                const mapDelayTime =
                    mapDelay !== undefined ? mapDelay : getDefaultMapDelay();

                if (mapDelayTime) {
                    setTimeout(() => {
                        // show mapPage after delay
                        if (maraudersMap && !maraudersMap.visible) {
                            maraudersMap.show();
                        }
                    }, mapDelayTime);
                } else {
                    // map delay is zero
                    maraudersMap.show();
                }
            }
        ),

        // |--------------------------------|
        // |        Mischief_Managed        |
        // |--------------------------------|

        vscode.commands.registerCommand(
            COMMANDS.endSpell,
            ({ command, args } = {}) => {
                // these MUST be called directly in function
                removeWhenContext(whenContext);
                maraudersMap.dispose();
                pageStatusBar.dispose();

                vscode.commands.executeCommand(command, args);
            }
        ),

        //   Save a new Spell to the page
        // --------------------------------
        vscode.commands.registerCommand(
            COMMANDS.saveSpell,
            ({ mapPage }) => {

            // if there is no mapPage

                // prompt user for what mapPage the spell should be saved to

                    // create a quickPick with

                    // an option to create a new mapPage

                        // create a new mapPage
                            // prompt for pageName
                            // promp for keybinding
                            // prompt for mapDelay
                        /*
                        {
                            "key": "cmd+e",
                            "command": "MaraudersMap.iSolemnlySwear...",
                            "args": {
                                "mapPage": "editor",
                                "icon": "somethingHere"
                                "mapDelay": 300, // if a number is set it will be used if not, default will be used
                            }
                        }
                        */
                        //   save the kew group to keybindings.json

                    // and a list of all the previously saved mapPages

            // ask the user what command they would like to save to the Page

                // populate a picker of all commands

            // ask for the keybinding for this command

            // ask for a custom label for the command

            // save the command to keybindings.json

            }
        ),

        //   open the map page, used for the pageStatusBar item
        // ------------------------------------------------------
        vscode.commands.registerCommand(COMMANDS.displayMap, () => {
            if (maraudersMap && !maraudersMap.visible) {
                maraudersMap.show();
            }
        })
    ); // end of subscriptions.push()
} // end of activate

/* example keybindings:
    {
        "key": "cmd+e",
        "command": "MaraudersMap.iSolemnlySwear...",
        "args": {
            "mapPage": "Editor",
            "mapDelay": 300, // if a number is set it will be used if not, default will be used
        }
    },
    {
        "key": "cmd+,",
        "command": "MaraudersMap.mischiefManaged",
        "when" : "MaraudersMap.editor",
        "args": {
            "label": "Split Editor Down"
            "command": "editor.splitDown",
        }
    }
*/

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
