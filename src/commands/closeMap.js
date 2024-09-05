const vscode = require('vscode');

// managers
const settings = require('../managers/settingsManager');
const whenMgr = require('../managers/whenManager');
const statusBarMgr = require('../managers/statusBarManager');
const mapManager = require('../managers/mapManager');

    // |--------------------------------|
    // |        Mischief_Managed        |
    // |--------------------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            settings.keys.commands.closeMap,
            ({ command, args } = {}) => {

                const {removeWhenContext} = whenMgr.use()
                removeWhenContext();

                mapManager.clean();
                statusBarMgr.clean();

                if (command) {

                    // |-----------------------|
                    // |        Feature        |
                    // |-----------------------|
                    // maybe add a setting to turn this off
                    statusBarMgr.mischief.initialize().show()
                    // naaaaaaaaaahhhhhh!

                    // if opening a nested page
                    if (command === settings.keys.commands.openMap){
                        // &&
                        if(mapManager.use()._visible){ // map is already visible
                            args.mapDelay = 0
                        } else { // map is not visible yet, reset timer
                            mapManager.cancelTimer()
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
