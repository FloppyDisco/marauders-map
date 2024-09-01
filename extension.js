const vscode = require("vscode");
const { getKeybindings, getSpellsForPage } = require("./src/managers/keybindingsManager");
const { maraudersMapPrefix, COMMANDS, SETTINGS } = require("./src/constants");
const { activateCreateGroupCommand } = require("./src/commands/createGroup");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    activateCreateGroupCommand(context);

	const extensionStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right,0)
	extensionStatusBar.text = SETTINGS.mapIcon
	extensionStatusBar.command = COMMANDS.startSpell
	extensionStatusBar.show();

    let maraudersMap;
    let pageStatusBar;
	let whenContext;

    context.subscriptions.push(
        // |--------------------------------------------------------|
        // |        I_Solemnly_Swear_That_I_Am_Up_To_No_Good        |
        // |--------------------------------------------------------|
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
        vscode.commands.registerCommand(
            COMMANDS.startSpell,
            ({ mapPage, mapDelay } = {}) => {

                whenContext = `${maraudersMapPrefix}.${mapPage}`;
                setWhenContext(whenContext, true);

				const keybindings = getKeybindings();


                pageStatusBar = vscode.window.createStatusBarItem(
                    vscode.StatusBarAlignment.Left, 0
                );
                pageStatusBar.text = `The Marauders Map ${SETTINGS.mapIcon}: ${mapPage}`;
                pageStatusBar.command = COMMANDS.displayMap;
                pageStatusBar.show();


                maraudersMap = vscode.window.createQuickPick();
                maraudersMap.title = `The Marauder's Map ${SETTINGS.mapIcon}`;
                maraudersMap.placeholder = "Choose your spell...";

                maraudersMap.items = [
                    {
                        label: "Add a spell",
                        command: COMMANDS.saveSpell,
                        args: { mapPage },
                    },
                    ...getSpellsForPage(keybindings, mapPage)
                ];

                maraudersMap.onDidHide(() => {
					// these MUST be called directly in function
                    setWhenContext(whenContext, undefined); // cancel the when context for this page of the map
                    maraudersMap.dispose();
                    pageStatusBar.dispose();
                });

                maraudersMap.onDidChangeSelection(([selection]) => {
						// these MUST be called directly in function
					setWhenContext(whenContext, undefined); // cancel the when context for this page of the map
                    maraudersMap.dispose();
                    pageStatusBar.dispose();
						// do not pull them out
                    vscode.commands.executeCommand(
                        selection.command,
                        selection.args // might need to expand these args? not sure
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
                // set a timer to cancel the when clause after a period of time?
            }
        ),

        // |--------------------------------|
        // |        Mischief_Managed        |
        // |--------------------------------|
        /*
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
        vscode.commands.registerCommand(
            COMMANDS.endSpell,
            ({ command, args }={}) => {
					// these MUST be called directly in function
				setWhenContext(whenContext, undefined); // cancel the current when context
				maraudersMap.dispose();
				pageStatusBar.dispose();
					// do not pull them out
				vscode.commands.executeCommand(command, args);
            }
        ),

        // open the map command, used for the pageStatusBar item
        vscode.commands.registerCommand(COMMANDS.displayMap, () => {
            if (maraudersMap && !maraudersMap.visible) {
                maraudersMap.show();
            }
        })
    );
}

function setWhenContext(key, value) {
    vscode.commands.executeCommand("setContext", key, value);
}

function getDefaultMapDelay() {
    return vscode.workspace
        .getConfiguration(maraudersMapPrefix)
        .get(SETTINGS.defaultMapDelay.key, SETTINGS.defaultMapDelay.value);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
