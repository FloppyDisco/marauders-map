const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");
// components
const maraudersMap = require("../components/maraudersMap");

// |---------------------|
// |        Lumos        |
// |---------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            settings.keys.commands.displayMap,
            () => {
                if (maraudersMap && !maraudersMap.visible) {
                    maraudersMap.show();
                }
            }
        )
    );
}

module.exports = {
    register,
};
