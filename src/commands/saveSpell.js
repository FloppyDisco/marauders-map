const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");
const keybindingsMgr = require("../managers/keybindingsManager");
const whenMgr = require("../managers/whenManager");
const promptManager = require("../managers/promptManager");
const mapManager = require("../managers/mapManager");

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

                let selectedArgs = undefined;
                let nestedPage;
                let selectedLabel;
                let selectedKey;
                let selectedOrder;

                switch (selectedCommand) {
                    case undefined:
                        // exit on 'Esc' key
                        return;
                    case settings.keys.commands.openMap:
                        //   command is nested page
                        // --------------------------

                        // get the page that this command will go to =>
                        nestedPage = await promptManager.promptUserForPage({isNestedPage: true});
                        if (nestedPage === undefined) {
                            return; // exit on 'Esc' key
                        }

                        selectedKey = await promptManager.promptUserForKey();
                        if (selectedKey === undefined) {
                            return; // exit on 'Esc' key
                        }

                        selectedLabel = undefined;
                        selectedArgs = {
                            mapPage: nestedPage,
                          }
                        break;
                    case "separator":
                        // command is adding a separator

                        // |-----------------------|
                        // |        Feature        |
                        // |-----------------------|

                        // prompt user for label
                        selectedLabel = await promptManager.promptUserForLabel(selectedCommand);
                        if (selectedLabel === undefined) {
                            return; // exit on 'Esc' key
                        }

                        // ask which command to put the separator above
                            // populate the page with the spells
                            // change the on did select to return the index of the selected spell
                            // assign the "order" arg to the index value

                        // selectedOrder = await promptManager.promptUserForPage(mapPage);
                        // not page, need to use mapManager to get the spells!!
                        const whenContext = whenMgr.serializer(mapPage);

                        mapManager.initialize({
                            mapPage,
                            whenContext,
                        })
                        selectedOrder = await mapManager.selectOrder();

                        if (selectedOrder === undefined){
                            return; // exit on 'Esc' key
                        }
                        break;
                    default:

                        selectedKey = await promptManager.promptUserForKey();
                        if (selectedKey === undefined) {
                            return; // exit on 'Esc' key
                        }

                        selectedLabel = await promptManager.promptUserForLabel(selectedCommand, selectedKey);
                        if (selectedLabel === undefined) {
                            return; // exit on 'Esc' key
                        }
                    break;
                }

                const newKeybinding = {
                    key: selectedKey ? selectedKey : undefined, // set to undefined for serialization
                    command: settings.keys.commands.closeMap,
                    when: whenMgr.serializer(mapPage),
                    args: {
                        command: selectedCommand,
                        label: selectedLabel,
                        order: selectedOrder,
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
