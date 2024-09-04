const vscode = require("vscode");


const keys = {
    maraudersMapPrefix: "maraudersMap",
    mapOpenContext: "maraudersMapIsOpen",
    defaultMapDelay: "defaultMapDelay",
    pageIcon: "pageIcon",
    subpageIcon: "subpageIcon",
    spellIcon: "spellIcon",
    displayMapTitle: "displayMapTitle",
    displayCommandId: "displayCommandId",
    commands: {
        saveSpell: "expectoPatronum",
        deleteSpell: "obliviate",
        openMap: "iSolemnlySwearThatIAmUpToNoGood",
        closeMap: "mischiefManaged",
        displayMap: "lumos",
        // revealSpell: "accio",
        // erecto
        // prior incantatoAccioAccio
    },
}

const buttons = {
    edit: {
        id: "edit",
        iconPath: new vscode.ThemeIcon("gear"),
        tooltip: "Edit this Spell",
    },
};

const mapIcon = "🗺️";


// |---------------------------------|
// |        Internal Settings        |
// |---------------------------------|

const internalConfigs = {
    inputBoxTitle: `The Marauders Map ${mapIcon}`,
    mapIcon: mapIcon, // might be able to get rid of this after refactor
    buttons,
    // pagesIcon: "$(files)",
    // subpagesIcon: "$(arrow-right)",
};



let configCache;

function updateStoredConfigs(){
    configCache = new Map([
        // contvert to key: value pairs for Map()
        ...Object.entries(internalConfigs), // internal settings
        ...Object.entries(vscode.workspace.getConfiguration(keys.maraudersMapPrefix)) // workspace settings
    ])
}

exports.initialize = () => {
    updateStoredConfigs();
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration(keys.maraudersMapPrefix)){
            updateStoredConfigs();
        }
    })
}

exports.useConfigs = () => {
    return [ configCache, keys ]
}
