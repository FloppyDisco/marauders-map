const vscode = require("vscode");
const { activateStartSpellCommand } = require("./src/commands/startSpellCommand");
const { activateEndSpellCommand } = require("./src/commands/endSpellCommand");
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

    activateStartSpellCommand(context, maraudersMap, pageStatusBar, whenContext);
    activateEndSpellCommand(context, maraudersMap, pageStatusBar, whenContext);

    context.subscriptions.push(
        // open the map command, used for the pageStatusBar item
        vscode.commands.registerCommand(COMMANDS.displayMap, () => {
            if (maraudersMap && !maraudersMap.visible) {
                maraudersMap.show();
            }
        })
    );
}


function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
