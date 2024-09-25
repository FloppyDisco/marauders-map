const vscode = require("vscode");
// managers
const Settings = require("../managers/settingsManager");
const When = require("../managers/whenManager");
const Prompts = require("../managers/promptManager");
const Map = require("../managers/mapManager");

// |--------------------------------|
// |        Expecto Patronum        |
// |--------------------------------|

function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Settings.keys.commands.saveSpell,
      async ({ mapPage } = {}) => {

        if (!mapPage) {
          return; // exit
        }

      }
    )
  );
}

module.exports = {
  register,
};
