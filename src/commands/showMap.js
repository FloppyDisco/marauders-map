const vscode = require("vscode");

// managers
const Settings = require("../managers/settingsManager");
const Picks = require("../managers/quickPickManager");

// |---------------------|
// |        Lumos        |
// |---------------------|

function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Settings.keys.commands.showMap, () => {
        if (Picks.selectSpellQuickPick && !Picks.selectSpellQuickPick._visible) {
            Picks.selectSpellQuickPick.show();
        }
      }
    )
  )
}

module.exports = {
  register,
};
