const vscode = require("vscode");

// managers
const settings = require("./settingsManager");
const keybindingsMgr = require("./keybindingsManager");
const statusBarMgr = require("./statusBarManager");
const promptsMgr = require("./promptManager");

let maraudersMap;
let mapOpenTimer;

/**
 * Function to create and return the maraudersMap
 * @returns {vscode.QuickPick} The maraudersMap quick pick
 */
function initialize({ mapDelay, mapPage, selectedPageManually, whenContext, removeWhenContext }) {

    if (maraudersMap) {
        // exists
        maraudersMap.dispose();
    }

    const configs = settings.useConfigs();
    
    //   Create Map
    // --------------

    maraudersMap = vscode.window.createQuickPick();

    const displayTitle = configs.get(settings.keys.displayMapTitle);
    if (displayTitle) {
        maraudersMap.title = `${configs.get(
            settings.keys.titleIcon
        )} ${mapPage}`;
    }
    maraudersMap.placeholder = "Choose your spell...";
    maraudersMap.onDidTriggerItemButton(promptsMgr.menuItemButtonTrigger);

    // |-----------------------|
    // |        Feature        |
    // |-----------------------|
    // go back page button for nested pages?
    // maraudersMap.buttons= [];



    maraudersMap.onDidHide(() => {
        removeWhenContext();
        maraudersMap.dispose();
        statusBarMgr.page.use().dispose();
    });

    maraudersMap.onDidChangeSelection(([selection]) => {
        //   Magic Sauce Is HERE
        // -----------------------
        removeWhenContext();
        maraudersMap.dispose();
        statusBarMgr.page.use().dispose();
        vscode.commands.executeCommand( // well ok, it's here...
            selection.command,
            selection.args
        );
    });


    //   Get Keybindings
    // -------------------

    const keybindings = keybindingsMgr.getKeybindingsForPage(whenContext);

    const spells = keybindingsMgr.convertToItems(keybindings);

    maraudersMap.items = [
        ...spells,
        {
            label: "$(add) New Spell",
            command: settings.keys.commands.saveSpell,
            args: { mapPage },
            alwaysShow: true,
        },
    ]

    const mapDelayTime =
        mapDelay !== undefined
            ? mapDelay
            : configs.get(settings.keys.defaultMapDelay);

    if (!selectedPageManually && mapDelayTime) {
        mapOpenTimer = setTimeout(() => {
            // show map after delay
            if (maraudersMap && !maraudersMap._visible) {
                maraudersMap.show();
            }
        }, mapDelayTime);
    } else {
        // map delay is zero, show map!
        maraudersMap.show();
    }
}

function use() {
    return maraudersMap;
}

function clean() {
    if(maraudersMap){
        maraudersMap.dispose();
    }
}

function cancelTimer(){
    console.log('cancelling timer:',mapOpenTimer);

    clearTimeout(mapOpenTimer);
}

module.exports = {
    initialize,
    use,
    clean,
    cancelTimer,
};
