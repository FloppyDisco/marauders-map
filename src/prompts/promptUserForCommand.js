const vscode = require('vscode');
// managers
const settings = require("../managers/settingsManager");

/**
 * Function to prompt the user to enter a command.
 * @returns {Promise<string | undefined>} The provided command or undefined if canceled.
 */
exports.promptUserForCommand = async () => {

    const configs = settings.useConfigs();
    const inputBoxTitle = configs.get(settings.keys.displayMapTitle) ? configs.get("inputBoxTitle") : ""

    let availableCommands = await vscode.commands.getCommands(true);
    availableCommands = availableCommands.map((cmd) => ({
        label: `${configs.get(settings.keys.spellIcon)} ${cmd}`,
        command: cmd,
    }));

    const addCustomCommand = {
        label: "$(pencil) Enter a custom command ...",
        alwaysShow: true,
    };

    const goToAnotherPage = {
        label: `${configs.get(settings.keys.subpageIcon)} Go to another Page ...`,
        command: settings.keys.commands.openMap,
        alwaysShow: true,
    };

    const options = [addCustomCommand, goToAnotherPage, ...availableCommands];
    const selectedOption = await vscode.window.showQuickPick(options, {
        title: inputBoxTitle,
        placeHolder: "Choose a command ...",
    });

    if (!selectedOption) {
        return undefined;
    }

    if (selectedOption.label === addCustomCommand.label) {
        // user wants to type in a custom command name
        selectedOption.command = await vscode.window.showInputBox({
            title: inputBoxTitle,
            placeHolder: "editor.action.blockComment",
            prompt: "A Command ... ",
            validateInput: (text) =>
                text.trim() === "" ? "Command cannot be empty" : null,
        });
    }

    return selectedOption.command.trim();
}
