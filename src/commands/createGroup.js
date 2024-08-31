const vscode = require('vscode');
const {COMMANDS} = require('../constants')
const {getKeybindings} = require('../keybindingsManager')
// |------------------------------------|
// |        Create Group Command        |
// |------------------------------------|

function activateCreateGroupCommand(context){
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.createGroup,() => {
            const keybindings = getKeybindings();
            console.log('keybindings',keybindings);
        })
    )
}

module.exports = {
    activateCreateGroupCommand,
}
