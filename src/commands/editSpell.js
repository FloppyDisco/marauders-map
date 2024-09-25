const vscode = require("vscode");
// managers
const Settings = require("../managers/settingsManager");
const Map = require("../managers/mapManager");
const Prompts = require("../managers/promptManager");


// |---------------------|
// |        Accio        |
// |---------------------|

function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Settings.keys.commands.editSpell, () => {
      const maraudersMap = Map.use();
      const pagePrompt = Prompts.usePagePrompt();
      if (maraudersMap) {
        triggerButton(maraudersMap);
      } else if (pagePrompt) {
        triggerButton(pagePrompt);
      }
    })
  );
}

function triggerButton(quickPick) {
  const button = quickPick.activeItems[0].buttons.find(
    (btn) => (btn.id = Settings.buttons.editSpell.id)
  );
  button.trigger();
}

module.exports = {
  register,
};
