const { revealKeybinding } = require("./managers/keybindingsManager");

const maraudersMapPrefix = "MaraudersMap";

const mapIcon = "🗺️";

const SETTINGS = {
    defaultMapDelay: {
        key: "defaultMapDelay",
        value: 1500,
    },
    mapOpenContext: "MaraudersMapIsOpen",
    inputBoxTitle: `The Marauders Map ${mapIcon}`,
    mapIcon: mapIcon,
    pagesIcon: "$(files)",
    subpagesIcon: "$(arrow-right)",
};

const COMMANDS = {
    saveSpell: `${maraudersMapPrefix}.expectoPatronum`,
    deleteSpell: `${maraudersMapPrefix}.obliviate`,
    openMap: `${maraudersMapPrefix}.iSolemnlySwearThatIAmUpToNoGood`,
    closeMap: `${maraudersMapPrefix}.mischiefManaged`,
    displayMap: `_${maraudersMapPrefix}.lumos`,
    // revealSpell: `${maraudersMapPrefix}.accio`,
    // erecto
    // prior incantatoAccioAccio
};

const BUTTONS = {
    edit: {
        id: "edit",
        iconPath: new vscode.ThemeIcon("gear"),
        tooltip: "Edit this Spell",
    },
    menuItemButtonTrigger: (event) => {
        const item = event.item;
        const button = event.button;
        const keybinding = item.keybinding;

        switch (button.id) {
            case "edit":
                revealKeybinding(keybinding);
                break;
            // potentially add more buttons in future
        }
    },
};

module.exports = {
    maraudersMapPrefix,
    SETTINGS,
    COMMANDS,
    BUTTONS,
};
