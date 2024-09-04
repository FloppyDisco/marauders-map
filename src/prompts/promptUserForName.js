const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");

/**
 * Function to prompt the user to enter a name for a new Page.
 * @returns {Promise<string | undefined>} The provided name or undefined if canceled.
 */
exports.promptUserForName = async (userInput = "") => {
    const configs = settings.useConfigs();
    const inputBoxTitle = configs.get(settings.keys.displayMapTitle)
        ? configs.get("inputBoxTitle")
        : "";

    return await vscode.window.showInputBox({
        title: inputBoxTitle,
        placeHolder: "The Room of Requirement",
        value: userInput, // Pre-fill with the captured user input
        prompt: "A Name ...",
        validateInput: (text) =>
            text.trim() === "" ? "Command cannot be empty" : null,
    });
};
