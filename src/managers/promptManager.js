const vscode = require("vscode");
const Settings = require("../managers/settingsManager");

/**
 * Function to prompt the user to enter a command.
 * @returns {Promise<string | undefined>} The provided command or undefined if canceled.
 */
async function promptUserForCommand() {
  const configs = Settings.useConfigs();
  const inputBoxTitle = configs.get(Settings.keys.displayMapTitle)
    ? configs.get(Settings.keys.inputBoxTitle)
    : "";

  let availableCommands = await vscode.commands.getCommands(true);
  availableCommands = availableCommands.map((cmd) => ({
    label: `${configs.get(Settings.keys.spellIcon)} ${cmd}`,
    command: cmd,
  }));

  const goToAnotherPage = {
    label: `${configs.get(Settings.keys.subpageIcon)} Go to another Page ...`,
    command: Settings.keys.commands.openMap,
    // alwaysShow: true,
  };

  const addSeparator = {
    label: "$(add) Add a Separator",
    command: "separator",
  };

  const addCustomCommand = {
    label: "$(pencil) Enter a custom command ...",
    alwaysShow: true,
  };

  const options = [
    goToAnotherPage,
    addSeparator,
    {
      kind: vscode.QuickPickItemKind.Separator,
      label: "commands",
    },
    ...availableCommands,
    addCustomCommand,
  ];
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

/**
 * Function to prompt the user to enter a keybinding.
 * @returns {Promise<string | undefined>} The provided keybinding or undefined if canceled.
 */
async function promptUserForKey() {
  const configs = Settings.useConfigs();
  const inputBoxTitle = configs.get(Settings.keys.displayMapTitle)
    ? configs.get(Settings.keys.inputBoxTitle)
    : "";

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

/**
 * Function to prompt the user to enter a label.
 * @returns {Promise<string | undefined>} The provided label or undefined if canceled.
 */
async function promptUserForLabel(selectedCommand, selectedKey) {
  // |----------------------|
  // |        Update        |
  // |----------------------|

  // this command needs to be used for creating a separator as well
  // change the placeholder based on the command value?

  const configs = Settings.useConfigs();
  const inputBoxTitle = configs.get(Settings.keys.displayMapTitle)
    ? configs.get(Settings.keys.inputBoxTitle)
    : "";
  const placeHolder =
    selectedCommand === "separator"
      ? "Provide a label for the separator (may be blank)"
      : `Or leave blank for default: ${selectedCommand} (${Settings.prettifyKey(
          selectedKey
        )})`;

  return await vscode.window.showInputBox({
    title: inputBoxTitle,
    placeHolder: placeHolder,
    prompt: "A Label ...",
    validateInput: (text) => {
      // test to see if the provided input is a keybinding
      return null; // Return null if the input is valid
    },
  });
}

/**
 * Function to prompt the user to enter a name for a new Page.
 * @returns {Promise<string | undefined>} The provided name or undefined if canceled.
 */
async function promptUserForNewPageName(userInput = "") {
  const configs = Settings.useConfigs();
  const inputBoxTitle = configs.get(Settings.keys.displayMapTitle)
    ? configs.get(Settings.keys.inputBoxTitle)
    : "";

  return await vscode.window.showInputBox({
    title: inputBoxTitle,
    placeHolder: "The Room of Requirement",
    value: userInput, // Pre-fill with the captured user input
    prompt: "A Name ...",
    validateInput: (text) =>
      text.trim() === "" ? "Command cannot be empty" : null,
  });
}


module.exports = {
  promptUserForCommand,
  promptUserForKey,
  promptUserForLabel,
  promptUserForNewPageName,
};
