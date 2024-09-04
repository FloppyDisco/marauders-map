const vscode = require("vscode");

const mapIcon = "🗺️";

const configKeys = {
    maraudersMapPrefix: "maraudersMap",
    mapOpenContext: "maraudersMapIsOpen",
    defaultMapDelay: "defaultMapDelay",
    pageIcon: "pageIcon",
    subpageIcon: "subpageIcon",
    spellIcon: "spellIcon",
    displayMapTitle: "displayMapTitle",
    displayCommandId: "displayCommandId",
    titleIcon: "titleIcon",
    examplePagesKey:"examplePagesInstalled",
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



// |---------------------------------|
// |        Internal Settings        |
// |---------------------------------|

const internalConfigs = {
    inputBoxTitle: `The Marauders Map ${mapIcon}`,
    titleIcon: mapIcon,
    buttons,
};

function getConfigs(){
    return new Map([
        // contvert to key: value pairs for Map()
        ...Object.entries(internalConfigs), // internal settings
        ...Object.entries(vscode.workspace.getConfiguration(configKeys.maraudersMapPrefix)) // workspace settings
    ])
}




let configCache;
/**
 * Function to initialize the workspace configurations
 */
function initialize() {
    configCache = getConfigs();
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration(configKeys.maraudersMapPrefix)){
            configCache = getConfigs();
        }
    })
}

/**
 * Function to use the workspace configurations.
 * Returns the cached configurations or initializes them if they are not set.
 *
 * @returns {[Map, {string: string}]} An array where the first element is the configs map, and the second is the keys object.
 */
function useConfigs() {
    const configs = configCache || getConfigs() // return the cache or go get the settings
    return configs
}

module.exports = {
    initialize,
    useConfigs,
    configKeys
}
