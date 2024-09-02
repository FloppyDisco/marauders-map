const vscode = require('vscode');

/**
 * Function to set the provided when clause context
 * @param {string} whenContext
 * @returns {null}
 */
exports.setPageWhenContext = (whenContext) => {
    vscode.commands.executeCommand("setContext", whenContext, true);
}

/**
 * Function to remove the provided when clause context
 * @param {string} whenContext
 * @returns {null}
 */
exports.removePageWhenContext = (whenContext) => {
    vscode.commands.executeCommand("setContext", whenContext, undefined);
}


const mapOpenContext = "MaraudersMapIsOpen"
/**
 * Function to set then map open when clause context
 * @returns {null}
 */
exports.setMapOpenContext = () => {
    vscode.commands.executeCommand("setContext", mapOpenContext, true);
}

/**
 * Function to remove the mapOpen when clause context
 * @returns {null}
 */
exports.removeMapOpenContext = () => {
    vscode.commands.executeCommand("setContext", mapOpenContext, undefined);
}
