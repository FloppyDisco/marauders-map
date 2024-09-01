const vscode = require("vscode");
const { maraudersMapPrefix, COMMANDS, SETTINGS } = require("../constants");
const {
    setWhenContext,
    removeWhenContext,
} = require("../managers/whenManager");
const {
    getKeybindings,
    getSpellsForPage,
} = require("../managers/keybindingsManager");
const { getDefaultMapDelay } = require("../managers/settingsManager");

// |--------------------------------------------------------|
// |        I_Solemnly_Swear_That_I_Am_Up_To_No_Good        |
// |--------------------------------------------------------|
/* example keybinding:
    {
        "key": "cmd+e",
        "command": "MaraudersMap.iSolemnlySwear...",
        "args": {
            "mapPage": "Editor",
            "mapDelay": 300, // if a number is set it will be used if not, default will be used
        }
    },
    ...
*/
exports.activateStartSpellCommand = (
    context,
    maraudersMap,
    pageStatusBar,
    whenContext
) => {
    context.subscriptions.push(
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
        )
    );
};
