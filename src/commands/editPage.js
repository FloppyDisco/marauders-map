const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");
const mapManager = require("../managers/mapManager");

// |----------------------|
// |        Erecto        |
// |----------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            settings.keys.commands.editPage,
            () => {
                const maraudersMap = mapManager.use()
                if (maraudersMap) {
                    maraudersMap.editPageButtonTrigger()
                    maraudersMap.dispose()
                }
            }
        )
    );
}

module.exports = {
    register,
};
