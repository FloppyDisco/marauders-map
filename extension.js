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
                pageStatusBar.text = `$(wand) ${mapPage}`;
                pageStatusBar.command = COMMANDS.displayMap;
                pageStatusBar.show();

                maraudersMap = vscode.window.createQuickPick();
                maraudersMap.title = SETTINGS.inputBoxTitle;
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
            async ({ mapPage }) => {

                if (!mapPage) {
                    // no map Page provided, we are creating a new map Page
                    mapPage = await promptUserForPage();
                    // promptUserForMapDelay();
                }

                const selectedCommand = await promptUserForCommand();

                if(!selectedCommand){return} // exit

                const isNestedPage = selectedCommand === COMMANDS.startSpell
                let nestedPage;
                if(isNestedPage){
                    nestedPage = await promptUserForPage();
                }

                const selectedKey = await promptUserForKey();

                const selectedLabel = isNestedPage
                    ? `$(arrow-right) Go to ${nestedPage} spells ...`
                    : await promptUserForLabel(selectedCommand, selectedKey);

                // |-----------------------|
                // |        Feature        |
                // |-----------------------|
                // give the user the ability to provide args for command
                //
                const selectedArgs = isNestedPage
                    ? {
                        mapPage: nestedPage,
                        mapDelay: 0
                    }
                    : undefined
                    // : promptUserForArgs();


                const newKeybinding = {
                    key: selectedKey,
                    command: COMMANDS.endSpell,
                    when: `${maraudersMapPrefix}.${mapPage}`,
                    args: {
                        command: selectedCommand,
                        label: selectedLabel,
                        args: selectedArgs
                    }
                }

                console.log('newKeybinding',newKeybinding);
                console.log('stringify(newKeybinding)',JSON.stringify(newKeybinding));

                // save newKeybinding to json

        // {
        //     "key": "cmd+,",
        //     "command": "MaraudersMap.mischiefManaged",
        //     "when" : "MaraudersMap.editor",
        //     "args": {
        //         "label": "Split Editor Down"
        //         "command": "editor.splitDown",
        //     }
        // },
        // {
        //     "key": "cmd+g",
        //     "command": "MaraudersMap.mischiefManaged",
        //     "when" : "MaraudersMap.Editor",
        //     "args": {
        //         "command": "MaraudersMap.iSolemnlySwearThatIAmUpToNoGood",
        //         "args": {
        //             "mapPage": "Git",
        //             "mapDelay": 0
        //         }
        //     }
        // },
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

    async function promptUserForCommand() {
        let availableCommands = await vscode.commands.getCommands(true);
        availableCommands = availableCommands.map((cmd) => ({label: `$(wand) ${cmd}`, command: cmd}))
        //
        const addCustomCommand = {
            label: "$(pencil) Enter a custom command ...",
            alwaysShow: true,
        };
        const goToAnotherPage = {
            label: "$(arrow-right) Go to another page ...",
            command: COMMANDS.startSpell,
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
        if (!selectedOption) {return undefined};
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
        return selectedOption.command.trim()
    }


    /**
     * Function to prompt the user to enter a keybinding.
     * @returns {Promise<string | undefined>} The provided keybinding or undefined if canceled.
     */
    async function promptUserForKey() {
        const selectedKey = await vscode.window.showInputBox({
            title: SETTINGS.inputBoxTitle,
            placeHolder: 'Enter a keybinding: cmd+h or ctrl+p ...',
            validateInput: (text) => {
                // test to see if the provided input is a keybinding
                return null;  // Return null if the input is valid
            }
        });
        return selectedKey ? selectedKey : undefined
    }


    async function promptUserForLabel(selectedCommand, selectedKey){
        const selectedLabel = await vscode.window.showInputBox({
            title: SETTINGS.inputBoxTitle,
            placeHolder: 'Enter a custom label ...',
            prompt: `Or leave blank for default: ${selectedCommand} (${selectedKey})`,
            validateInput: (text) => {
                // test to see if the provided input is a keybinding
                return null;  // Return null if the input is valid
            }
        });
        return selectedLabel ? selectedLabel : undefined
    }
    async function saveCommandToMapPage(mapPage) {
        // MapPage is now set
        // ----------------------

        // Ask the user what command they would like to save to the Page
        const availableCommands = await vscode.commands.getCommands(true);
        const commandSelection = await vscode.window.showQuickPick(
            availableCommands.map((command) => ({ label: command })),
            {
                title: `Select a command to save to the ${mapPage} page`,
                placeHolder: "Choose a command...",
            }
        );

        // If the user cancels the selection, exit the function
        if (!commandSelection) {
            vscode.window.showInformationMessage(
                "No command selected. Operation canceled."
            );
            return;
        }
        const selectedCommand = commandSelection.label;

        // Ask for the keybinding for this command
        const keybinding = await vscode.window.showInputBox({
            prompt: `Enter the keybinding for the command '${selectedCommand}'`,
            placeHolder: "e.g., ctrl+k ctrl+c",
            validateInput: (text) => {
                return text.trim() === "" ? "Keybinding cannot be empty" : null;
            },
        });

        // If the user cancels the input box, exit the function
        if (!keybinding) {
            vscode.window.showInformationMessage(
                "No keybinding entered. Operation canceled."
            );
            return;
        }

        // Ask for a custom label for the command
        const customLabel = await vscode.window.showInputBox({
            prompt: `Enter a custom label for the command '${selectedCommand}'`,
            placeHolder: "e.g., My Custom Command",
            validateInput: (text) => {
                return text.trim() === "" ? "Label cannot be empty" : null;
            },
        });

        // If the user cancels the input box, exit the function
        if (!customLabel) {
            vscode.window.showInformationMessage(
                "No label entered. Operation canceled."
            );
            return;
        }

        // Save the command to keybindings.json
        const keybindings = vscode.workspace.getConfiguration("keybindings");
        const currentKeybindings = keybindings.get("keybindings", []);

        const newKeybinding = {
            key: keybinding,
            command: selectedCommand,
            when: `MaraudersMap.${mapPage}`,
            label: customLabel,
        };

        currentKeybindings.push(newKeybinding);
    }

    async function promptUserForPage() {
        return "no page provided";
        // ask what mapPage the spell should go on?

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
    }
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
