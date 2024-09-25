const vscode = require('vscode');

// managers
const Settings = require('../managers/settingsManager');
const When = require('../managers/whenManager');
const StatusBars = require('../managers/statusBarManager');
const Map = require('../managers/mapManager');

    // |--------------------------------|
    // |        Mischief_Managed        |
    // |--------------------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            Settings.keys.commands.closeMap,
            ({ command, args } = {}) => {

                When.use().removeWhenContext();
                Map.dispose();
                StatusBars.dispose();

                if (command) {

                    // |-----------------------|
                    // |        Feature        |
                    // |-----------------------|
                    // maybe add a setting to turn this off
                    StatusBars.mischief.initialize().show()
                    // naaaaaaaaaahhhhhh!

                    // if opening a nested page
                    if (command === Settings.keys.commands.openMap){
                        // &&
                        if(Map.use()._visible){ // map is already visible
                            args.mapDelay = 0
                        } else { // map is not visible yet, reset timer
                            Map.cancelTimer()
                        }
                    }

                    vscode.commands.executeCommand(command, args);
                }

            }
        )
    )
}


module.exports = {
    register
}
