const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");
const KBmanager = require("../managers/keybindingsManager");
const whenManager = require("../managers/whenManager");

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
                    mapPage = await promptUserForPage();
                    if (mapPage === undefined) {
                        return; // exit on 'Esc' key
                    }
                }

                const selectedCommand = await promptUserForCommand();
                if (selectedCommand === undefined) {
                    return; // exit on 'Esc' key
                }

                const isNestedPage =
                    selectedCommand === settings.keys.commands.openMap;
                let nestedPage; // exist for scope
                if (isNestedPage) {
                    // get the page that this command will go to =>
                    nestedPage = await promptUserForPage(isNestedPage);
                    if (nestedPage === undefined) {
                        return; // exit on 'Esc' key
                    }
                }

                const selectedKey = await promptUserForKey();
                if (selectedKey === undefined) {
                    return; // exit on 'Esc' key
                }

                const selectedLabel = isNestedPage
                    ? ""
                    : await promptUserForLabel(selectedCommand, selectedKey);
                if (selectedLabel === undefined) {
                    return; // exit on 'Esc' key
                }

                const selectedArgs = isNestedPage
                    ? {
                          mapPage: nestedPage,
                          mapDelay: 0,
                      }
                    : undefined;

                const newKeybinding = {
                    key: selectedKey ? selectedKey : undefined, // set to undefined for serialization
                    command: settings.keys.commands.closeMap,
                    when: whenManager.serializer(mapPage),
                    args: {
                        command: selectedCommand,
                        label: selectedLabel ? selectedLabel : undefined, // set to undefined for serialization
                        args: selectedArgs,
                    },
                };
                KBmanager.saveKeybinding(newKeybinding);
            }
        )
    );
}

module.exports = {
    register,
};
