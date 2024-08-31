const vscode = require('vscode');
const {COMMANDS} = require('../constants')
const {getKeybindings} = require('../managers/keybindingsManager')

// |------------------------------------|
// |        Create Group Command        |
// |------------------------------------|

function activateSaveSpellCommand(context){

    // function to create new mapPage
    // homonculusCharm

    // function to save a new spell to a page


context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.saveSpell,(mapPage) => {

            // if there is no mapPage

                // prompt user for what mapPage the spell should be saved to

                    // create a quickPick with

                    // an option to create a new mapPage

                        // create a new mapPage
                            // prompt for pageName
                            // promp for keybinding
                            // prompt for mapDelay
                        /*
                        {
                            "key": "cmd+e",
                            "command": "MaraudersMap.iSolemnlySwear...",
                            "args": {
                                "mapPage": "editor",
                                "icon": "somethingHere"
                                "mapDelay": 300, // if a number is set it will be used if not, default will be used
                            }
                        }
                        */
                        //   save the kew group to keybindings.json

                    // and a list of all the previously saved mapPages

            // ask the user what command they would like to save to the Page

                // populate a picker of all commands

            // ask for the keybinding for this command

            // ask for a custom label for the command

            // save the command to keybindings.json

            /*

            {
                "key": "cmd+,",
                "command": "MaraudersMap.mischiefManaged",
                "when" : "MaraudersMap.editor",
                "args": {
                    "command": "editor.splitDown",
                }
            }

            */









            const keybindings = getKeybindings();
            console.log('keybindings',keybindings);
        })
    )
}

module.exports = {
    activateCreateGroupCommand: activateSaveSpellCommand,
}
