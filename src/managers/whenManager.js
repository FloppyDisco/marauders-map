const { SETTINGS } = require('../constants');

const vscode = require('vscode');

/**
 * Function to set the provided when clause context
 * @param {string} whenContext
 * @returns {null}
 */
exports.setPageWhenContext = (whenContext) => {
    vscode.commands.executeCommand("setContext", SETTINGS.mapOpenContext, true);
    vscode.commands.executeCommand("setContext", whenContext, true);
}

/**
 * Function to remove the provided when clause context
 * @param {string} whenContext
 * @returns {null}
 */
exports.removePageWhenContext = (whenContext) => {
    vscode.commands.executeCommand("setContext", SETTINGS.mapOpenContext, undefined);
    vscode.commands.executeCommand("setContext", whenContext, undefined);
}


// /**
//  * Function to set then map open when clause context
//  * @returns {null}
//  */
// function setMapOpenContext(){
//     vscode.commands.executeCommand("setContext", SETTINGS.mapOpenContext, true);
// }

// /**
//  * Function to remove the mapOpen when clause context
//  * @returns {null}
//  */
// function removeMapOpenContext(){
//     vscode.commands.executeCommand("setContext", SETTINGS.mapOpenContext, undefined);
// }
