const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");
const mapManager = require("../managers/mapManager");
const promptManager = require("../managers/promptManager");


// |---------------------|
// |        Accio        |
// |---------------------|

function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(settings.keys.commands.editSpell, () => {
      const maraudersMap = mapManager.use();
      const pagePrompt = promptManager.usePagePrompt();
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
    (btn) => (btn.id = settings.buttons.editSpell.id)
  );
  button.trigger();
}

module.exports = {
  register,
};
