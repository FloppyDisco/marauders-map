const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");

// not really a huge fan of this, but this is where the code lives at the moment
const maraudersMap = require("../components/maraudersMap");

    /**
     * Function to prompt the user to enter a label.
     * @returns {Promise<string | undefined>} The provided label or undefined if canceled.
     */
    exports.promptUserForLabel = async (selectedCommand, selectedKey) =>{
        const configs = settings.useConfigs();
        const inputBoxTitle = configs.get(settings.keys.displayMapTitle)
            ? configs.get("inputBoxTitle")
            : "";

        return await vscode.window.showInputBox({
            title: inputBoxTitle,
            placeHolder: `Or leave blank for default: ${selectedCommand} (${maraudersMap.prettifyKey(selectedKey)})`,
            prompt: "A Label ...",
            validateInput: (text) => {
                // test to see if the provided input is a keybinding
                return null; // Return null if the input is valid
            },
        });
    }
