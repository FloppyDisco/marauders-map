const vscode = require('vscode');
const {configKeys} = require('../managers/settingsManager');


/**
 * Creates the necessary "when" clause context functions for the Page in VS Code.
 *
 * This function generates a formatted string for the when context based on the provided page title
 * and returns an object containing the whenContext string, a function to set the whenContext, and
 * a function to remove the whenContext.
 *
 * @param {string} mapPage - The title for this page of the map, used to generate the when context.
 * @returns {{whenContext: string, setWhenContext: function, removeWhenContext: function}} - An object containing:
 *   - `whenContext`: The formatted string to be used as the when context for this page.
 *   - `setWhenContext`: A function to set the necessary when contexts in VS Code.
 *   - `removeWhenContext`: A function to remove the necessary when contexts in VS Code.
 */
function useWhenContext(mapPage) {
    const whenContext = `${configKeys.maraudersMapPrefix}.${mapPage.replaceAll(" ", "_")}`;

    /**
     * Sets the page's "when" clause context.
     */
    function setWhenContext() {
        vscode.commands.executeCommand("setContext",configKeys.mapOpenContext, true);
        vscode.commands.executeCommand("setContext", whenContext, true);
    }

    /**
     * Removes the page's "when" clause context.
     */
    function removeWhenContext() {
        vscode.commands.executeCommand("setContext",configKeys.mapOpenContext, undefined);
        vscode.commands.executeCommand("setContext", whenContext, undefined);
    }

    return { whenContext, setWhenContext, removeWhenContext };
}

module.exports = {
    useWhenContext
}
