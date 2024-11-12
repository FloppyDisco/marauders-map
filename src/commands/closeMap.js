const vscode = require("vscode");

// managers
const Settings = require("../managers/settingsManager");
const When = require("../managers/whenManager");
const StatusBars = require("../managers/statusBarManager");
const Picks = require("../managers/quickPickManager");

// |--------------------------------|
// |        Mischief_Managed        |
// |--------------------------------|

function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Settings.keys.commands.closeMap,
      ({ command, args } = {}) => {

        When.removePreviousContext();
        StatusBars.dispose();

        if (Picks.selectSpellQuickPick) {
          Picks.selectSpellQuickPick.discard();
        }

        StatusBars.mischief.initialize().show();

        if (command) {
          // if opening a nested page
          if (command === Settings.keys.commands.openMapPage) {
            // &&
            if (Picks.selectSpellQuickPick && Picks.selectSpellQuickPick.visible) {
              // map is already visible
              args.mapDelay = 0;
            } else {
              // map is not visible yet, reset timer
              Picks.cancelTimer();
            }
          }

          // |---------------------------------------|
          // |        ok, Actually it's HERE!        |
          // |---------------------------------------|

          vscode.commands.executeCommand(command, args);
        }
      }
    )
  );
}

module.exports = {
  register,
};
