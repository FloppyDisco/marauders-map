const vscode = require("vscode");
const { SETTINGS } = require("../constants");
/**
 * Function to read the keybinding groups from the settings.json file.
 * @returns {Array} The array of keybinding groups, or an empty array if not set.
 */
function getKeybindingGroups() {
    const config = vscode.workspace.getConfiguration();
    const keybindingGroups = config.get(SETTINGS.groups, []);
    return keybindingGroups;
}

// function for updating settingGroups
