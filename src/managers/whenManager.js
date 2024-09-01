const vscode = require('vscode');

/**
 * Function to set the provided when clause context
 * @param {string} whenContext
 * @returns {null}
 */
exports.setWhenContext = (whenContext) => {
    vscode.commands.executeCommand("setContext", whenContext, true);
}

/**
 * Function to remove the provided when clause context
 * @param {string} whenContext
 * @returns {null}
 */
exports.removeWhenContext = (whenContext) => {
    vscode.commands.executeCommand("setContext", whenContext, undefined);
}
