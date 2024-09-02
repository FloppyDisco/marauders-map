const vscode = require("vscode");
const { maraudersMapPrefix, COMMANDS, SETTINGS } = require("./src/constants");
const { getDefaultMapDelay } = require("./src/managers/settingsManager");
const {
    setPageWhenContext,
    removePageWhenContext,
} = require("./src/managers/whenManager");
const {
    getKeybindings,
    getSpellsForPage,
    getAllPagesFromMap,
    saveKeybinding,
} = require("./src/managers/keybindingsManager");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    //   Do something with this
    // --------------------------

    const extensionStatusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        0
    );
    extensionStatusBar.text = SETTINGS.mapIcon;
    extensionStatusBar.command = COMMANDS.openMap;
    extensionStatusBar.show();

    let maraudersMap;
    let pageStatusBar;
    let pagePrompt;
    let whenContext;

    context.subscriptions.push(
        // |--------------------------------------------------------|
        // |        I_Solemnly_Swear_That_I_Am_Up_To_No_Good        |
        // |--------------------------------------------------------|

        vscode.commands.registerCommand(
            COMMANDS.openMap,
            async ({ mapPage, mapDelay } = {}) => {
                if (pagePrompt) {
                    pagePrompt.hide();
                } // cancel the previous call to openMap if a specific mapPage is called

                let selectedPageManually = false
                if (!mapPage) {
                    mapPage = await promptUserForPage();
                    if (mapPage === undefined) {return} // exit on 'Esc' key
                    selectedPageManually = true
                }
                // |-------------------|
                // |        BUG        |
                // |-------------------|

                // space in when context messes up scoping
                // may be fixed with .replace()
                whenContext = `${maraudersMapPrefix}.${mapPage.replace(
                    " ",
                    "_"
                )}`;
                setPageWhenContext(whenContext);

                const keybindings = getKeybindings();

                if (pageStatusBar) {
                    pageStatusBar.dispose();
                }
                pageStatusBar = vscode.window.createStatusBarItem(
                    vscode.StatusBarAlignment.Left,
                    0
                );
                pageStatusBar.text = `$(wand) ${mapPage}`;
                pageStatusBar.tooltip =
                    "Sometimes spells go wonky, click to close!";
                pageStatusBar.command = COMMANDS.closeMap;
                pageStatusBar.show();

                if (maraudersMap) {
                    maraudersMap.dispose();
                }
                maraudersMap = vscode.window.createQuickPick();
                maraudersMap.title = `${SETTINGS.mapIcon} ${mapPage}`;
                maraudersMap.placeholder = "Choose your spell...";

                maraudersMap.items = [
                    {
                        label: "$(add) New Spell",
                        command: COMMANDS.saveSpell,
                        args: { mapPage },
                        alwaysShow: true
                    },
                    ...getSpellsForPage(keybindings, mapPage),
                ];

                // |-----------------------|
                // |        Feature        |
                // |-----------------------|

                // add buttons to the box
                // maraudersMap.buttons= [];
                /*


                    */
                // add buttons to each item
                // move item up
                // move item down
                /*
                    {
                        label: 'Item 2',
                        description: 'Description for item 2',
                        buttons: [
                            {
                                iconPath: new vscode.ThemeIcon('trash'), // Another built-in VS Code icon
                                tooltip: 'Delete this item'
                            }
                        ]
                    }


                    // Event listener for when a button is clicked
                    quickPick.onDidTriggerItemButton((e) => {
                        if (e.button.tooltip === 'Edit this item') {
                            vscode.window.showInformationMessage(`Editing: ${e.item.label}`);
                        } else if (e.button.tooltip === 'Delete this item') {
                            vscode.window.showInformationMessage(`Deleting: ${e.item.label}`);
                        }
                    });
                    */

                maraudersMap.onDidHide(() => {
                    // these MUST be called directly in function
                    removePageWhenContext(whenContext); // cancel the when context for this page of the map
                    maraudersMap.dispose();
                    pageStatusBar.dispose();
                });

                maraudersMap.onDidChangeSelection(([selection]) => {
                    // these MUST be called directly in function
                    removePageWhenContext(whenContext);
                    maraudersMap.dispose();
                    pageStatusBar.dispose();

                    vscode.commands.executeCommand(
                        selection.command,
                        selection.args
                    );
                });

                const mapDelayTime =
                    mapDelay !== undefined ? mapDelay : getDefaultMapDelay();

                if (!selectedPageManually && mapDelayTime) {
                    setTimeout(() => {
                        // show map after delay
                        if (maraudersMap && !maraudersMap.visible) {
                            maraudersMap.show();
                        }
                    }, mapDelayTime);
                } else {
                    // map delay is zero, show map!
                    maraudersMap.show();
                }
            }
        ),

        // |--------------------------------|
        // |        Mischief_Managed        |
        // |--------------------------------|

        vscode.commands.registerCommand(
            COMMANDS.closeMap,
            ({ command, args } = {}) => {
                // these MUST be called directly in function
                removePageWhenContext(whenContext);
                maraudersMap.dispose();
                // |-----------------------|
                // |        Feature        |
                // |-----------------------|
                // briefly show mischief managed when spell is cast
                pageStatusBar.dispose();
                if (command) {
                    vscode.commands.executeCommand(command, args);
                }
            }
        ),

        // |--------------------------------|
        // |        Expecto Patronum        |
        // |--------------------------------|

        vscode.commands.registerCommand(
            COMMANDS.saveSpell,
            async ({ mapPage } = {}) => {
                if (!mapPage) {
                    // get the page that this command will be stored on
                    mapPage = await promptUserForPage();
                    if (mapPage === undefined) {return} // exit on 'Esc' key
                }

                // |-------------------|
                // |        BUG        |
                // |-------------------|
                // saving a new page from the menu for a nested page does not nest the page

                const selectedCommand = await promptUserForCommand();
                if (selectedCommand === undefined) {
                    return;
                } // exit on 'Esc' key

                const isNestedPage = selectedCommand === COMMANDS.openMap;
                let nestedPage;
                if (isNestedPage) {
                    // get the page that this command will go to =>
                    nestedPage = await promptUserForPage(isNestedPage);
                    if (nestedPage === undefined) {
                        return;
                    } // exit on 'Esc' key
                }

                const selectedKey = await promptUserForKey();
                if (selectedKey === undefined) {
                    return;
                } // exit on 'Esc' key

                const selectedLabel = isNestedPage
                    ? `${SETTINGS.subpagesIcon} Go to ${nestedPage} spells ...`
                    : await promptUserForLabel(selectedCommand, selectedKey);
                if (selectedLabel === undefined) {
                    return;
                } // exit on 'Esc' key

                // |-----------------------|
                // |        Feature        |
                // |-----------------------|
                // give the user the ability to provide args for command
                //
                const selectedArgs = isNestedPage
                    ? {
                          mapPage: nestedPage,
                          mapDelay: 0,
                      }
                    : undefined;
                // : promptUserForArgs();

                const newKeybinding = {
                    key: selectedKey ? selectedKey : undefined,
                    command: COMMANDS.closeMap,
                    when: `${maraudersMapPrefix}.${mapPage.replace(" ", "_")}`,
                    args: {
                        command: selectedCommand,
                        label: selectedLabel ? selectedLabel : undefined,
                        args: selectedArgs,
                    },
                };
                saveKeybinding(newKeybinding);
            }
        ),

        // |---------------------|
        // |        Lumos        |
        // |---------------------|

        vscode.commands.registerCommand(COMMANDS.displayMap, () => {
            if (maraudersMap && !maraudersMap.visible) {
                maraudersMap.show();
            }
        })
    ); // end of subscriptions.push()

    /**
     * Function to prompt the user to enter a command.
     * @returns {Promise<string | undefined>} The provided command or undefined if canceled.
     */
    async function promptUserForCommand() {
        let availableCommands = await vscode.commands.getCommands(true);
        availableCommands = availableCommands.map((cmd) => ({
            label: `$(wand) ${cmd}`,
            command: cmd,
        }));
        //
        const addCustomCommand = {
            label: "$(pencil) Enter a custom command ...",
            alwaysShow: true,
        };
        const goToAnotherPage = {
            label: `${SETTINGS.subpagesIcon} Go to another page ...`,
            command: COMMANDS.openMap,
            alwaysShow: true,
        };
        const options = [
            addCustomCommand,
            goToAnotherPage,
            ...availableCommands,
        ];
        const selectedOption = await vscode.window.showQuickPick(options, {
            title: SETTINGS.inputBoxTitle,
            placeHolder: "Choose a command ...",
        });
        //
        if (!selectedOption) {
            return undefined;
        }
        //
        if (selectedOption.label === addCustomCommand.label) {
            selectedOption.command = await vscode.window.showInputBox({
                title: SETTINGS.inputBoxTitle,
                placeHolder: "Enter your command ...",
                validateInput: (text) =>
                    text.trim() === "" ? "Command cannot be empty" : null,
            });
        }
        //
        return selectedOption.command.trim();
    }

    /**
     * Function to prompt the user to enter a keybinding.
     * @returns {Promise<string | undefined>} The provided keybinding or undefined if canceled.
     */
    async function promptUserForKey() {
        console.log("prompting user for a key binding");

        return await vscode.window.showInputBox({
            title: SETTINGS.inputBoxTitle,
            placeHolder: "Enter a keybinding: cmd+h or ctrl+p ...",
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
        return await vscode.window.showInputBox({
            title: SETTINGS.inputBoxTitle,
            placeHolder: "Enter a custom label ...",
            prompt: `Or leave blank for default: ${selectedCommand} (${selectedKey})`,
            validateInput: (text) => {
                // test to see if the provided input is a keybinding
                return null; // Return null if the input is valid
            },
        });
    }

    /**
     * Function to create a new page in the map
     * @param {string} mapPage the name of the page to be created
     * @returns {Promise<string | undefined>} the create Map Page name or undefined if canceled.
     */
    async function createNewMapPage(mapPage) {
        return new Promise(async (resolve) => {
            const selectedKey = await promptUserForKey();
            if (selectedKey) {
                const selectedMapDelay = "";
                const keybinding = {
                    key: selectedKey,
                    command: COMMANDS.openMap,
                    when: `!${SETTINGS.mapOpenContext}`,
                    args: {
                        mapPage,
                        mapDelay: selectedMapDelay
                            ? selectedMapDelay
                            : undefined,
                    },
                };
                saveKeybinding(keybinding);
                resolve(mapPage);
            }
            resolve(undefined);
        });
    }

    /**
     * Function to prompt the user to enter a mapPage
     * @returns {Promise<string | undefined>} The provided page name or undefined if canceled.
     */
    async function promptUserForPage(isNestedPage = false) {

        const keybindings = getKeybindings();
        const allPages = getAllPagesFromMap(keybindings);

        const addMapPage = {
            label: "$(add) New Page to Map",
            alwaysShow: true,
        };
        const options = [...allPages, addMapPage];

        pagePrompt = vscode.window.createQuickPick();
        pagePrompt.items = options;
        pagePrompt.title = SETTINGS.inputBoxTitle;
        pagePrompt.placeholder = "Select a page ...";
        let userInput = "";
        pagePrompt.onDidChangeValue((value) => {
            userInput = value;
        });

        return new Promise((resolve) => {
            pagePrompt.onDidAccept(async () => {
                pagePrompt.hide();
                const [selectedOption] = pagePrompt.selectedItems;
                if (selectedOption.label === addMapPage.label) {
                    //   Create a new page
                    // ---------------------
                    if (isNestedPage) {
                        resolve(
                            await vscode.window.showInputBox({
                                title: SETTINGS.inputBoxTitle,
                                placeHolder:
                                    "Enter a title for the new page of the map ...",
                                value: userInput, // Pre-fill with the captured user input
                                validateInput: (text) =>
                                    text.trim() === ""
                                        ? "Command cannot be empty"
                                        : null,
                            })
                        ); // Resolve to the new page name
                    } else {
                        resolve(
                            await createNewMapPage(
                                await vscode.window.showInputBox({
                                    title: SETTINGS.inputBoxTitle,
                                    placeHolder:
                                        "Enter a title for the new page of the map ...",
                                    value: userInput, // Pre-fill with the captured user input
                                    validateInput: (text) =>
                                        text.trim() === ""
                                            ? "Command cannot be empty"
                                            : null,
                                })
                            )
                        );
                    }
                } else {
                    //   Select a pre-existing page
                    // ------------------------------
                    resolve(selectedOption.mapPage);
                }
            });

            pagePrompt.onDidHide(() => {
                pagePrompt.dispose();
            });

            pagePrompt.show();
        });
    }
} // end of activate

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};

/* example keybindings:
    {
        "key": "cmd+e",
        "command": "MaraudersMap.iSolemnlySwearThatIAmUpToNoGood",
        "when": "!MaraudersMapIsOpen",
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
    },
    {
    "key": "cmd+g",
    "command": "MaraudersMap.mischiefManaged",
    "when" : "MaraudersMap.Editor",
    "args": {
        "command": "MaraudersMap.iSolemnlySwearThatIAmUpToNoGood",
        "args": {
            "mapPage": "Git",
            "mapDelay": 0
        }
    }
},
*/
