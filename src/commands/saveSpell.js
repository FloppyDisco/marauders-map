const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");
const keybindingsMgr = require("../managers/keybindingsManager");
const whenMgr = require("../managers/whenManager");
const promptManager = require("../managers/promptManager");

// |--------------------------------|
// |        Expecto Patronum        |
// |--------------------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            settings.keys.commands.saveSpell,
            async ({ mapPage } = {}) => {
                if (!mapPage) {
                    // get the page that this command will be saved on
                    mapPage = await promptManager.promptUserForPage();
                    if (mapPage === undefined) {
                        return; // exit on 'Esc' key
                    }
                }

                const selectedCommand = await promptManager.promptUserForCommand();
                if (selectedCommand === undefined) {
                    return; // exit on 'Esc' key
                }

                const isNestedPage =
                    selectedCommand === settings.keys.commands.openMap;
                let nestedPage; // exist for scope
                if (isNestedPage) {
                    // get the page that this command will go to =>
                    nestedPage = await promptManager.promptUserForPage(isNestedPage);
                    if (nestedPage === undefined) {
                        return; // exit on 'Esc' key
                    }
                }

                const selectedKey = await promptManager.promptUserForKey();
                if (selectedKey === undefined) {
                    return; // exit on 'Esc' key
                }

                const selectedLabel = isNestedPage
                    ? ""
                    : await promptManager.promptUserForLabel(selectedCommand, selectedKey);
                if (selectedLabel === undefined) {
                    return; // exit on 'Esc' key
                }

                const selectedArgs = isNestedPage
                    ? {
                        mapPage: nestedPage,
                      }
                    : undefined;

                const newKeybinding = {
                    key: selectedKey ? selectedKey : undefined, // set to undefined for serialization
                    command: settings.keys.commands.closeMap,
                    when: whenMgr.serializer(mapPage),
                    args: {
                        command: selectedCommand,
                        label: selectedLabel ? selectedLabel : undefined, // set to undefined for serialization
                        args: selectedArgs,
                    },
                };
                keybindingsMgr.saveKeybinding(newKeybinding);
            }
        )
    );
}

module.exports = {
    register,
};
