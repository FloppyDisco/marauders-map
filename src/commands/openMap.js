const vscode = require("vscode");
// managers
const Settings = require("../managers/settingsManager");
const Map = require("../managers/mapManager");
const StatusBars = require("../managers/statusBarManager");
const Prompts = require("../managers/promptManager");
const When = require("../managers/whenManager");

// |----------------------------------------------------------|
// |        I Solemnly Swear That I Am Up To No Good ...      |
// |----------------------------------------------------------|

function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Settings.keys.commands.openMap,
      async ({ mapPage, mapDelay, separators } = {}) => {
        // console.log('openMap()',);


        // remove any old UI elements from previous spells
        Map.dispose();
        Prompts.dispose();
        StatusBars.dispose();

        if (!mapPage) {
          vscode.commands.executeCommand(Settings.keys.commands.showMap);
          return; // exit
        }

        //   Set the When Context
        // ------------------------
        When.initialize(mapPage).setWhenContext();

        StatusBars.page.initialize(mapPage).show();

        Map.initialize({
          mapPage,
          separators,
          mapDelay,
        });
      }
    )
  );
}

module.exports = {
  register,
};
