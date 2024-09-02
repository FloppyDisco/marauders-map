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
    getAllMapPages,
    saveKeybinding,
} = require("./src/managers/keybindingsManager");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let mapIsOpen = false;
    const extensionStatusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        0
    );
    extensionStatusBar.text = SETTINGS.mapIcon;
    extensionStatusBar.command = COMMANDS.openMap;
    extensionStatusBar.show();

    let maraudersMap;
    let pageStatusBar;
    let whenContext;

    context.subscriptions.push(
        // |--------------------------------------------------------|
        // |        I_Solemnly_Swear_That_I_Am_Up_To_No_Good        |
        // |--------------------------------------------------------|

        vscode.commands.registerCommand(
            COMMANDS.openMap,
            ({ mapPage, mapDelay } = {}) => {
                if (mapIsOpen){return} // exit if command is already running
                mapIsOpen = true;

                if (!mapPage) {
                    vscode.commands.executeCommand(COMMANDS.saveSpell);
                } else {

                    whenContext = `${maraudersMapPrefix}.${mapPage}`;
                    setPageWhenContext(whenContext);

                    const keybindings = getKeybindings();

                    if (pageStatusBar){
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

                    if (maraudersMap){
                        maraudersMap.dispose();
                    }
                    maraudersMap = vscode.window.createQuickPick();
                    maraudersMap.title = `${SETTINGS.mapIcon} ${mapPage}`;
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
                        mapDelay !== undefined
                            ? mapDelay
                            : getDefaultMapDelay();

                    if (mapDelayTime) {
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
                mapIsOpen = false;
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
                if(mapIsOpen){return} // exit
                mapIsOpen = true;

                if (!mapPage) {
                    mapPage = await promptUserForPage();
                    if (mapPage === undefined) {
                        return;
                    } // exit on 'Esc' key
                }

                const selectedCommand = await promptUserForCommand();
                if (selectedCommand === undefined) {
                    return;
                } // exit on 'Esc' key

                const isNestedPage = selectedCommand === COMMANDS.openMap;
                let nestedPage;
                if (isNestedPage) {
                    nestedPage = await promptUserForPage();
                    if (nestedPage === undefined) {
                        return;
                    } // exit on 'Esc' key
                }

                const selectedKey = await promptUserForKey();
                if (selectedKey === undefined) {
                    return;
                } // exit on 'Esc' key

                const selectedLabel = isNestedPage
                    ? `$(arrow-right) Go to ${nestedPage} spells ...`
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
                    when: `${maraudersMapPrefix}.${mapPage}`,
                    args: {
                        command: selectedCommand,
                        label: selectedLabel ? selectedLabel : undefined,
                        args: selectedArgs,
                    },
                };
                saveKeybinding(newKeybinding);
                mapIsOpen = false;
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
            label: "$(arrow-right) Go to another page ...",
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
     * Function to prompt the user to enter a time for mapDelay.
     * @returns {Promise<number | undefined>} The provided delay time or undefined if canceled.
     */
    async function promptUserForMapDelay() {
        const mapDelayTime = await vscode.window.showInputBox({
            title: SETTINGS.inputBoxTitle,
            placeHolder: "Enter a delay time before opening the map ...",
            prompt: `Or leave blank for default: ${getDefaultMapDelay()}(ms)`,
            validateInput: (text) => {
                // test to see if the provided input is an acceptable number value
                return null; // Return null if the input is valid
            },
        });
        return Number(mapDelayTime);
    }

    /**
     * Function to create a new page in the map
     * @returns {Promise<null | undefined>} null or undefined if canceled.
     */
    async function createNewMapPage(mapPage) {
        console.log("creating  a new map page!");

        const selectedKey = await promptUserForKey();
        if (selectedKey === undefined) {
            return undefined;
        } // exit on 'Esc' key

        const selectedMapDelay = await promptUserForMapDelay();
        if (selectedMapDelay === undefined) {
            return undefined;
        } // exit on 'Esc' key

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
        return true;
    }

    /**
     * Function to prompt the user to enter a mapPage
     * @returns {Promise<string | undefined>} the provided page name or undefined if canceled.
     */
    async function promptUserForPage() {
        const keybindings = getKeybindings();
        const allPages = getAllMapPages(keybindings).map((page) => ({
            label: `$(files)$(wand) ${page}`,
            mapPage: page,
        }));

        const addMapPage = {
            label: "$(add) New Page to Map",
            alwaysShow: true,
        };
        const options = [addMapPage, ...allPages];
        const selectedOption = await vscode.window.showQuickPick(options, {
            title: SETTINGS.inputBoxTitle,
            placeHolder: "Select a page to add your spell to ...",
        });
        //
        if (!selectedOption) {
            return undefined;
        } // exit on 'Esc' key
        //
        // |-----------------------|
        // |        Feature        |
        // |-----------------------|
        // capture the text of the inputBox it the user types before selecting addNewPage
        if (selectedOption.label === addMapPage.label) {
            selectedOption.mapPage = await vscode.window.showInputBox({
                title: SETTINGS.inputBoxTitle,
                placeHolder: "Enter a title for the new page of the map ...",
                validateInput: (text) =>
                    text.trim() === "" ? "Command cannot be empty" : null,
            });

            if (!(await createNewMapPage(selectedOption.mapPage))) {
                return undefined;
            } // exit on 'Esc' key
        }
        //
        console.log("page selected returning", selectedOption.mapPage);

        return selectedOption.mapPage;
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
