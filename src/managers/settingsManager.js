const vscode = require("vscode");
const os = require("os");
const path = require("path");
const fs = require("fs");

let configCache;
let defaultValues;


const platform = os.platform();
const isVSCodium = vscode.env.appName.includes("VSCodium");


/**
 * Function to initialize the workspace configurations
 *
 */
function initialize(context) {
    // get values
    defaultValues = getDefaultValuesFromPackageJSON();
    configCache = getConfigs();

    // add event listener for config changes
    context.subscriptions.push([
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration(keys.maraudersMapPrefix)) {
                configCache = getConfigs();
            }
        })
    ])
}


/**
 * Function to take a json keybinding code and return a human friendly display version
 * @param {string} keyCode the json keybinding.key
 * @returns {string} the prettified keyCode
 */
function prettifyKey(keyCode) {
    //  "cmd+alt+e" => "⌘⌥E"
    return keyCode
        ? `(${keyCode})`
            .toUpperCase()
            .replaceAll("+", "")
            .replace("CMD", "⌘")
            .replace("ALT", "⌥")
            .replace("CTRL", "^")
            .replace("SHIFT", "⇧")
        : ""
}

//   Internal Settings
// ---------------------
const mapIcon = "🗺️";
const maraudersMapPrefix = "maraudersMap";

const buttons = {
    edit: {
        id: "edit",
        iconPath: new vscode.ThemeIcon("gear"),
        tooltip: "Edit this Spell",
    },
};
const keys = {
    maraudersMapPrefix: maraudersMapPrefix,
    mapOpenContext: "maraudersMapIsOpen",
    defaultMapDelay: "defaultMapDelay",
    pageIcon: "pageIcon",
    subpageIcon: "subpageIcon",
    spellIcon: "spellIcon",
    displayMapTitle: "displayMapTitle",
    displayCommandId: "displayCommandId",
    titleIcon: "titleIcon",
    inputBoxTitle: "inputBoxTitle",
    examplePagesKey: "examplePagesInstalled",
    commands: {
        saveSpell: `${maraudersMapPrefix}.expectoPatronum`,
        deleteSpell: `${maraudersMapPrefix}.obliviate`,
        openMap: `${maraudersMapPrefix}.iSolemnlySwearThatIAmUpToNoGood`,
        closeMap: `${maraudersMapPrefix}.mischiefManaged`,
        displayMap: `${maraudersMapPrefix}.lumos`,
        // revealSpell: "accio",
        // erecto
        // prior incantato
    },
};

//   Settings.json
// -----------------

function getDefaultValuesFromPackageJSON() {
    const packageJsonPath = path.join(__dirname, "..","..","package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.contributes.configuration.properties["maraudersMap"]
        .properties;
}

function getConfigValue(workspace, key) {
    return workspace.get(key, defaultValues[key]);
}

function getConfigs() {
    const workspace = vscode.workspace.getConfiguration(
        keys.maraudersMapPrefix
    );

    const configs = new Map();

    // internal settings
    configs.set(keys.titleIcon, mapIcon);
    configs.set(keys.inputBoxTitle, `The Marauders Map ${mapIcon}`);

    // settings.json
    Object.keys(defaultValues).forEach((key) => {
        configs.set(key, getConfigValue(workspace, key));
    });

    return configs;
}

/**
 * Function to use the workspace configurations.
 * Returns the cached configurations or initializes them if they are not set.
 *
 * @returns {[Map, {string: string}]} An array where the first element is the configs map, and the second is the keys object.
 */
function useConfigs() {
    return configCache || getConfigs(); // return the cache or go get the settings
}

module.exports = {
    initialize,
    useConfigs,
    keys,
    buttons,
    prettifyKey,
    platform,
    isVSCodium
};


// |-----------------------|
// |        Feature        |
// |-----------------------|

// possible future settings:

// maraudersMap.ImADirtyMuggle: true => turn the Harry PotterNess off.
