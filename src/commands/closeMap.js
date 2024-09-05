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

                    // Feature
                    // maybe add a setting to turn this off
                    statusBarMgr.mischief.initialize().show()

                    // |---------------------|
                    // |        *BUG*        |
                    // |---------------------|

                    // calling a nested page before the map has opened, will immediately cause the map to display on the second page
                    // it would be better if the delay was maintained to the next page.

                    // // testing this
                    if (mapManager.use()._visible){
                        args.mapDelay = 0
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
