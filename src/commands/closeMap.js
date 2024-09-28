const vscode = require('vscode');

// managers
const Settings = require('../managers/settingsManager');
const When = require('../managers/whenManager');
const StatusBars = require('../managers/statusBarManager');
const Picks = require('../managers/quickPickManager');

    // |--------------------------------|
    // |        Mischief_Managed        |
    // |--------------------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            Settings.keys.commands.closeMap,
            ({ command, args } = {}) => {
                // console.log('-------- closeMap() --------',);

                When.removeWhenContext();
                StatusBars.dispose();

                if (command) {
                    // |-----------------------|
                    // |        Feature        |
                    // |-----------------------|
                    // maybe add a setting to turn this shit off
                    StatusBars.mischief.initialize().show()
                    // naaaaaaaaaahhhhhh! fuck 'em! lol

                    // if opening a nested page
                    if (command === Settings.keys.commands.openMap){
                        // &&
                        if(Picks.selectSpellQuickPick._visible){ // map is already visible
                            Picks.dispose();
                            args.mapDelay = 0;
                        } else { // map is not visible yet, reset timer
                            Picks.cancelTimer();
                            Picks.dispose();
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
