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
    revealKeybinding
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
    let mischiefStatusBar;
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
                if (mischiefStatusBar) {
                    mischiefStatusBar.dispose();
                }

                let selectedPageManually = false;
                if (!mapPage) {
                    mapPage = await promptUserForPage();
                    if (mapPage === undefined) {
                        return; // exit on 'Esc' key
                    }
                    selectedPageManually = true;
                }

                whenContext = `${maraudersMapPrefix}.${mapPage.replace(
                    " ",
                    "_"
                )}`;
                setPageWhenContext(whenContext);

                const keybindings = getKeybindings();

                //   Create the Status Bar
                // -------------------------

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

                //   Create the Map!
                // -------------------

                if (maraudersMap) {
                    maraudersMap.dispose();
                }
                maraudersMap = vscode.window.createQuickPick();
                maraudersMap.title = `${SETTINGS.mapIcon} ${mapPage}`;
                maraudersMap.placeholder = "Choose your spell...";

                maraudersMap.items = [
                    ...getSpellsForPage(keybindings, whenContext),
                    {
                        label: "$(add) New Spell",
                        command: COMMANDS.saveSpell,
                        args: { mapPage },
                        alwaysShow: true,
                    },
                ];

                // |-----------------------|
                // |        Feature        |
                // |-----------------------|

                // add buttons to the box
                // maraudersMap.buttons= [];
                /*
                    go back page button for nested pages?
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

                maraudersMap.onDidTriggerItemButton((event) => {
                    const item = event.item;
                    const button = event.button;
                    const keybinding = item.keybinding

                    switch (button.id) {
                        case "edit":
                            revealKeybinding(keybinding);
                            break;
                        // potentially add more buttons in future
                    }
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
                pageStatusBar.dispose();
                //
                if (mischiefStatusBar) { // remove the old one
                    mischiefStatusBar.dispose();
                }
                mischiefStatusBar = vscode.window.createStatusBarItem(
                    vscode.StatusBarAlignment.Left,
                    0
                );
                mischiefStatusBar.text = "$(wand) Mischief Managed...";
                mischiefStatusBar.show();
                setTimeout(() => {
                    mischiefStatusBar.dispose();
                }, 1000);
                //
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
                    // get the page that this command will be saved on
                    mapPage = await promptUserForPage();
                    if (mapPage === undefined) {
                        return; // exit on 'Esc' key
                    }
                }

                const selectedCommand = await promptUserForCommand();
                if (selectedCommand === undefined) {
                    return; // exit on 'Esc' key
                }
                const isNestedPage = selectedCommand === COMMANDS.openMap;
                let nestedPage; // exist for scope
                if (isNestedPage) {
                    // get the page that this command will go to =>
                    nestedPage = await promptUserForPage(isNestedPage);
                    if (nestedPage === undefined) {
                        return; // exit on 'Esc' key
                    }
                }

                const selectedKey = await promptUserForKey();
                if (selectedKey === undefined) {
                    return; // exit on 'Esc' key
                }

                const selectedLabel = isNestedPage
                    ? ""
                    : await promptUserForLabel(selectedCommand, selectedKey);
                if (selectedLabel === undefined) {
                    return; // exit on 'Esc' key
                }

                const selectedArgs = isNestedPage
                    ? {
                          mapPage: nestedPage,
                          mapDelay: 0,
                      }
                    : undefined;

                const newKeybinding = {
                    key: selectedKey ? selectedKey : undefined, // set to undefined for serialization
                    command: COMMANDS.closeMap,
                    when: `${maraudersMapPrefix}.${mapPage.replace(" ", "_")}`,
                    args: {
                        command: selectedCommand,
                        label: selectedLabel ? selectedLabel : undefined, // set to undefined for serialization
                        args: selectedArgs,
                    },
                };
                saveKeybinding(newKeybinding);
            }
        ),

        // |-------------------------|
        // |        Obliviate        |
        // |-------------------------|

        // |-----------------------|
        // |        Feature        |
        // |-----------------------|

        // delete spell command


        // |---------------------|
        // |        Lumos        |
        // |---------------------|

        vscode.commands.registerCommand(COMMANDS.displayMap, () => {
            if (maraudersMap && !maraudersMap.visible) {
                maraudersMap.show();
            }
        }),

    ); // end of subscriptions.push()


    /*
















    */

   // |-----------------------|
   // |        Prompts        |
   // |-----------------------|

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
                placeHolder: "editor.action.blockComment",
                prompt: "A Command ... ",
                validateInput: (text) =>
                    text.trim() === "" ? "Command cannot be empty" : null,
            });
        }
        //
        return selectedOption.command.trim();
    }

    /**
     * Function to prompt the user to enter a name for a new Page.
     * @returns {Promise<string | undefined>} The provided name or undefined if canceled.
     */
    async function promptUserForName(userInput = "") {
        return await vscode.window.showInputBox({
            title: SETTINGS.inputBoxTitle,
            placeHolder: "The Room of Requirement",
            value: userInput, // Pre-fill with the captured user input
            prompt: "A Name ...",
            validateInput: (text) =>
                text.trim() === "" ? "Command cannot be empty" : null,
        });
    }

    /**
     * Function to prompt the user to enter a keybinding.
     * @returns {Promise<string | undefined>} The provided keybinding or undefined if canceled.
     */
    async function promptUserForKey() {
        return await vscode.window.showInputBox({
            title: SETTINGS.inputBoxTitle,
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
        return await vscode.window.showInputBox({
            title: SETTINGS.inputBoxTitle,
            placeHolder: `Or leave blank for default: ${selectedCommand} (${selectedKey})`,
            prompt: "A Label ...",
            validateInput: (text) => {
                // test to see if the provided input is a keybinding
                return null; // Return null if the input is valid
            },
        });
    }

    /**
     * Function to create a new page on the map
     * @param {string} mapPage the name of the page to be created
     * @param {string} selectedKey the keybinding for the new page
     * @returns {Promise<string | undefined>} the name of the Map Page that was created, or undefined if canceled.
     */
    function createNewMapPage(mapPage, selectedKey) {
        if (mapPage && selectedKey) {
            const selectedMapDelay = "";
            const keybinding = {
                key: selectedKey,
                command: COMMANDS.openMap,
                when: `!${SETTINGS.mapOpenContext}`,
                args: {
                    mapPage,
                    mapDelay: selectedMapDelay ? selectedMapDelay : undefined,
                },
            };
            saveKeybinding(keybinding);
            return mapPage;
        }
        return undefined; // exit
    }

    /**
     * Function to prompt the user to select a Page
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
                    // Selected to create a new page
                    if (isNestedPage) {
                        resolve( // the new name for the page
                            await promptUserForName(userInput)
                        );
                    } else { // is not a nested page


                        resolve( // the new name for the page after creation
                            createNewMapPage(
                                // |---------------------|
                                // |        *BUG*        |
                                // |---------------------|

                                // escaping out of the pick a name prompt still goes to the select a keybinding prompt
                                // would be nice if the first escape cancelled both

                                await promptUserForName(userInput),
                                await promptUserForKey()
                            )
                        );
                    }
                } else {
                    //   Selected a pre-existing page
                    resolve(selectedOption.mapPage);
                }
            });

            pagePrompt.onDidHide(() => {
                pagePrompt.dispose();
                pagePrompt = null;
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
