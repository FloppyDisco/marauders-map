const vscode = require('vscode');
const { activateCreateGroupCommand } = require('./src/commands/createGroup');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	activateCreateGroupCommand(context);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
