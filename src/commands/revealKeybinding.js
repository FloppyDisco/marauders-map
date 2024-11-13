const vscode = require("vscode");

// managers
const Settings = require("../managers/settingsManager");
const Keybindings = require("../managers/keybindingsManager");

// |-------------------------|
// |        Alohomora        |
// |-------------------------|

/*
This command is only here to provide functionality
for revealing keybindings from a link in notifications
*/
function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Settings.keys.commands.revealKeybinding,(keybinding) => {
        if (keybinding){
            Keybindings.revealKeybinding(keybinding)
        }
      }
    )
  )
}

module.exports = {
  register,
};
