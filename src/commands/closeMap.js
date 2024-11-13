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
        //console.log('---------- closeMap()');

        // remove the mapPage Context from openMap
        // i don't think this needs to be here,
        // the page context will be removed from the openMap command being discarded
        // When.removePreviousPageContext();

        StatusBars.dispose();

        // discard the QP from openMap
        if (Picks.selectSpellQuickPick) {
          Picks.selectSpellQuickPick.discard();
        }

        StatusBars.mischief.initialize().show();

        if (command) { // a command is passed
          if (command === Settings.keys.commands.openMapPage) {
            // the command is opening another Page
            if (Picks.selectSpellQuickPick && Picks.selectSpellQuickPick.visible) {
              // && map is already visible
              // show the Page immediately
              args.mapDelay = 0;
            } else {
              // map is not visible yet: reset the timer
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
