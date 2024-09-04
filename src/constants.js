const vscode = require('vscode');
const maraudersMapPrefix = "maraudersMap";

const mapIcon = "🗺️";

const SETTINGS = {
    defaultMapDelay: {
        key: "defaultMapDelay",
        value: 1500,
    },
    mapOpenContext: "maraudersMapIsOpen",
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
};

module.exports = {
    maraudersMapPrefix,
    SETTINGS,
    COMMANDS,
    BUTTONS,
};
