const vscode = require('vscode');

// managers
const settings = require('../managers/settingsManager');
const whenManager = require('../managers/whenManager');

// components
const mischiefStatusBar = require('../components/mischiefStatusBar')
const pageStatusBar = require('../components/pageStatusBar');
const maraudersMap = require('../components/maraudersMap');

    // |--------------------------------|
    // |        Mischief_Managed        |
    // |--------------------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            settings.keys.commands.closeMap,
            ({ command, args } = {}) => {

                const {removeWhenContext} = whenManager.use()
                removeWhenContext();

                // these potentially might not work because of stack delay
                maraudersMap.removeIfExists();
                pageStatusBar.removeIfExists();
                mischiefStatusBar.create();

                if (command) {

                    // |---------------------|
                    // |        *BUG*        |
                    // |---------------------|

                    // calling a nested page before the map has opened, will immediately cause the map to display on the second page
                    // it would be better if the delay was maintained to the next page.


                    // testing this
                    if (maraudersMap.visible){
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
