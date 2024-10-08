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
        // console.log('-------- closeMap() --------',);

        When.removePreviousContext();
        StatusBars.dispose();

        if (
          Picks.selectSpellQuickPick &&
         !Picks.selectSpellQuickPick._disposed
        ) {
          Picks.selectSpellQuickPick.clean();
        }

        if (command) {
          StatusBars.mischief.initialize().show();

          // if opening a nested page
          if (command === Settings.keys.commands.openMap) {
            // &&
            if (Picks.selectSpellQuickPick && Picks.selectSpellQuickPick._visible) {
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
