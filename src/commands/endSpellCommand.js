const vscode = require("vscode");
const { COMMANDS } = require("../constants");
const {
    removeWhenContext,
} = require("../managers/whenManager");

// |--------------------------------------------------------|
// |        I_Solemnly_Swear_That_I_Am_Up_To_No_Good        |
// |--------------------------------------------------------|
/* example keybinding:
    {
        "key": "cmd+e",
        "command": "MaraudersMap.iSolemnlySwear...",
        "args": {
            "mapPage": "Editor",
            "mapDelay": 300, // if a number is set it will be used if not, default will be used
        }
    },
    ...
*/
exports.activateEndSpellCommand = (
    context,
    maraudersMap,
    pageStatusBar,
    whenContext
) => {
    context.subscriptions.push(

        // |--------------------------------|
        // |        Mischief_Managed        |
        // |--------------------------------|
        /*
            {
                "key": "cmd+,",
                "command": "MaraudersMap.mischiefManaged",
                "when" : "MaraudersMap.editor",
                "args": {
					"label": "Split Editor Down"
                    "command": "editor.splitDown",
                }
            }
		*/
        vscode.commands.registerCommand(
            COMMANDS.endSpell,
            ({ command, args }={}) => {
					// these MUST be called directly in function
				removeWhenContext(whenContext);
				maraudersMap.dispose();
				pageStatusBar.dispose();

				vscode.commands.executeCommand(command, args);
            }
        )
    );
};
