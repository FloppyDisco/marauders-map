const vscode = require("vscode");

// managers
const settings = require("./settingsManager");
const keybindingsMgr = require("./keybindingsManager");
const statusBarMgr = require("./statusBarManager");

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
    visible = false;

    const displayTitle = configs.get(settings.keys.displayMapTitle);
    if (displayTitle) {
        maraudersMap.title = `${configs.get(
            settings.keys.titleIcon
        )} ${mapPage}`;
    }
    maraudersMap.placeholder = "Choose your spell...";

    maraudersMap.open = () => {
        visible = true;
        maraudersMap.show();
    };

    maraudersMap.onDidTriggerItemButton((event) => {
        const item = event.item;
        const selectedButton = event.button;
        const keybinding = item.keybinding;

        switch (selectedButton.id) {
            case settings.buttons.edit.id:
                keybindingsMgr.revealKeybinding(keybinding);
                break;
            // potentially add more buttons in future
        }
    });

    // |-----------------------|
    // |        Feature        |
    // |-----------------------|
    // go back page button for nested pages?
    // maraudersMap.buttons= [];

    maraudersMap.isVisible = () => {
        return visible;
    };


    maraudersMap.onDidHide(() => {
        maraudersMap.dispose();
        statusBarMgr.page.use().dispose();
        removeWhenContext();
        visible = null;
    });

    maraudersMap.onDidChangeSelection(([selection]) => {
        //   Magic Sauce Is HERE
        // -----------------------
        maraudersMap.dispose();
        statusBarMgr.page.use().dispose();
        removeWhenContext();
        visible = null;
        vscode.commands.executeCommand(
            selection.command,
            selection.args
        );
    });


    //   Get Keybindings
    // -------------------

    const keybindings = keybindingsMgr.getKeybindingsForPage(whenContext);

    const spells = keybindingsMgr.convertToItems(keybindings);

    maraudersMap.items = spells

    maraudersMap.items.push(
        {
            label: "$(add) New Spell",
            command: settings.keys.commands.saveSpell,
            args: { mapPage },
            alwaysShow: true,
        },
    );

    const mapDelayTime =
        mapDelay !== undefined
            ? mapDelay
            : configs.get(settings.keys.defaultMapDelay);

    if (!selectedPageManually && mapDelayTime) {
        mapOpenTimer = setTimeout(() => {
            // show map after delay
            if (maraudersMap && !maraudersMap.isVisible) {
                maraudersMap.open();
            }
        }, mapDelayTime);
    } else {
        // map delay is zero, show map!
        maraudersMap.open();
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
