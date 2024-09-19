const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");
const mapManager = require("../managers/mapManager");

// |---------------------|
// |        Lumos        |
// |---------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            settings.keys.commands.displayMap,
            () => {
                const maraudersMap = mapManager.use()
                if (maraudersMap && !maraudersMap._visible) {
                    maraudersMap.show();
                }
            }
        )
    );
}

module.exports = {
    register,
};
