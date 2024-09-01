const vscode = require("vscode");
const { SETTINGS, maraudersMapPrefix } = require("../constants");

/**
 * Function to read the user's default mapDelay setting
 * @returns {number} the user defined value for map delay in seconds
 */
exports.getDefaultMapDelay = () => {
    return vscode.workspace
        .getConfiguration(maraudersMapPrefix)
        .get(SETTINGS.defaultMapDelay.key, SETTINGS.defaultMapDelay.value);
};
