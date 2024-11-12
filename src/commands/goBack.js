const vscode = require("vscode");

// managers
const Settings = require("../managers/settingsManager");
const Picks = require("../managers/quickPickManager");

// |-------------------------------|
// |        Prior Incantato        |
// |-------------------------------|

function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Settings.keys.commands.goBack, () => {
        if (Picks.selectSpellQuickPick && Picks.selectSpellQuickPick.previousPage) {
            vscode.commands.executeCommand(Settings.keys.commands.closeMap,{
                command: Settings.keys.commands.openMapPage,
                args: {
                    mapPage: Picks.selectSpellQuickPick.previousPage,
                    mapDelay: 0
                }
            })
        }
      }
    )
  )
}

module.exports = {
  register,
};
