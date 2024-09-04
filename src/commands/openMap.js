const vscode = require("vscode");
// managers
const KBmanager = require("../managers/keybindingsManager");
const whenManager = require("../managers/whenManager");
const settings = require("../managers/settingsManager");

// components
const mischiefStatusBar = require("../components/mischiefStatusBar");
const solemnlySwearStatusBar = require("../components/solenmlySwearStatusBar");
const pageStatusBar = require("../components/pageStatusBar");
const maraudersMap = require("../components/maraudersMap");

// |----------------------------------------------------------|
// |        I Solemnly Swear That I Am Up To No Good ...      |
// |----------------------------------------------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            settings.keys.commands.openMap,
            async ({ mapPage, mapDelay } = {}) => {
                // remove any old UI elements from previous spells
                // if (pagePrompt) {
                //     pagePrompt.hide();
                // }

                const configs = settings.useConfigs();

                mischiefStatusBar.removeIfExists();
                solemnlySwearStatusBar.removeIfExists();

                //   Create the Map!
                // -------------------

                maraudersMap.create();

                // if no page do the no page stuff...
                let selectedPageManually = false;
                if (!mapPage) {
                    //   Refactor Prompt Components
                    // ------------------------------

                    solemnlySwearStatusBar.create();
                    mapPage = await promptUserForPage();

                    // |---------------------|
                    // |        *BUG*        |
                    // |---------------------|

                    // clicking away
                    // or escaping prompt
                    // from Map does not get rid of the solemnlySwearStatusBar item

                    solemnlySwearStatusBar.item.dispose();
                    if (mapPage === undefined) {
                        return; // exit on 'Esc' key
                    }
                    selectedPageManually = true;
                }

                // if page do the page stuff...

                //   Set the When Context
                // ------------------------
                const { whenContext, setWhenContext } = whenManager.initialize();
                setWhenContext();
                pageStatusBar.create();

                //   Update the Map
                // ------------------
                maraudersMap.updateTitle(mapPage);
                maraudersMap.component.placeholder = "Choose your spell...";

                const keybindings =
                    KBmanager.getKeybindingsForPage(whenContext);

                const spells =
                    maraudersMap.convertKeybindingsToQuickPickItems(
                        keybindings
                    );

                maraudersMap.addItems([
                    ...spells,
                    {
                        label: "$(add) New Spell",
                        command: settings.keys.commands.saveSpell,
                        args: { mapPage },
                        alwaysShow: true,
                    },
                ]);

                const mapDelayTime =
                    mapDelay !== undefined
                        ? mapDelay
                        : configs.get(settings.keys.defaultMapDelay);

                if (!selectedPageManually && mapDelayTime) {
                    setTimeout(() => {
                        // show map after delay
                        if (maraudersMap.component && !maraudersMap.visible) {
                            maraudersMap.showComponent();
                        }
                    }, mapDelayTime);
                } else {
                    // map delay is zero, show map!
                    maraudersMap.showComponent();
                }
            }
        )
    );
}

module.exports = {
    register,
};
