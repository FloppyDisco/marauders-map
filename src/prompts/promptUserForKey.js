const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");

/**
 * Function to prompt the user to enter a keybinding.
 * @returns {Promise<string | undefined>} The provided keybinding or undefined if canceled.
 */
exports.promptUserForKey = async () => {

    const configs = settings.useConfigs();
    const inputBoxTitle = configs.get(settings.keys.displayMapTitle) ? configs.get("inputBoxTitle") : ""

    return await vscode.window.showInputBox({
        title: inputBoxTitle,
        placeHolder: "ctrl+shift+r or cmd+l",
        prompt: "A keybinding ... ",
        validateInput: (text) => {
            // test to see if the provided input is a keybinding
            return null; // Return null if the input is valid
        },
    });
}
