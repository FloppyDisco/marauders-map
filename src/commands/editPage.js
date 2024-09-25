const vscode = require("vscode");
// managers
const Settings = require("../managers/settingsManager");
const Map = require("../managers/mapManager");

// |----------------------|
// |        Erecto        |
// |----------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            Settings.keys.commands.editPage,
            () => {
                const maraudersMap = Map.use()
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
