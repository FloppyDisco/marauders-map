const vscode = require("vscode");
// managers
const settings = require("../managers/settingsManager");
const whenMgr = require("../managers/whenManager");
const mapManager = require("../managers/mapManager");
const statusBarMgr = require("../managers/statusBarManager");
const promptManager = require("../managers/promptManager");

// |----------------------------------------------------------|
// |        I Solemnly Swear That I Am Up To No Good ...      |
// |----------------------------------------------------------|

function register(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            settings.keys.commands.openMap,
            async ({ mapPage, mapDelay } = {}) => {

                // remove any old UI elements from previous spells
                mapManager.clean();
                promptManager.clean();
                statusBarMgr.clean();

                let selectedPageManually = false;
                if (!mapPage) {

                    // show generic status bar
                    const solemnlySwearStatusBar =
                        statusBarMgr.solenmlySwear.initialize();
                    solemnlySwearStatusBar.show();

                    mapPage = await promptManager.promptUserForPage()

                    solemnlySwearStatusBar.dispose();
                    if (mapPage === undefined) {
                        return; // exit on 'Esc' key
                    }
                    selectedPageManually = true;
                }

                //   Set the When Context
                // ------------------------
                const { whenContext, setWhenContext, removeWhenContext } =
                    whenMgr.initialize(mapPage);

                setWhenContext();

                statusBarMgr.page.initialize(mapPage).show();

                mapManager.initialize({
                    mapPage,
                    whenContext,
                    removeWhenContext
                })
                mapManager.callMap({
                    mapDelay,
                    selectedPageManually,
                });

            }
        )
    );
}

module.exports = {
    register,
};
