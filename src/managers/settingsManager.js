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
    goBack: {
        id: "goBack",
        iconPath: new vscode.ThemeIcon("arrow-left"),
        tooltip: "Go to Previous Page",
    },
    editSpell: {
        id: "editSpell",
        iconPath: new vscode.ThemeIcon("go-to-file"),
        tooltip: "Edit this Spell",
    },
    editPage: {
        id: "editPage",
        iconPath: new vscode.ThemeIcon("go-to-file"),
        tooltip: "Edit this Page",
    },
    moveSpell: {
        id: "order",
        iconPath: new vscode.ThemeIcon("list-unordered"),
        tooltip: "Move Spell",
    },
    removeSpell: {
        id: "remove",
        iconPath: new vscode.ThemeIcon("close"),
        tooltip: "Delete Spell",
    },
};
const keys = {
    maraudersMapPrefix: maraudersMapPrefix,
    mapIsActive: "maraudersMapIsActive",
    mapIsVisible: "maraudersMapIsVisible",
    selectingMapPage: "selectingMapPage",
    defaultMapDelay: "defaultMapDelay",
    defaultShowMap: "defaultShowMap",
    pageIcon: "pageIcon",
    subpageIcon: "subpageIcon",
    spellIcon: "spellIcon",
    displayMapTitle: "displayMapTitle",
    displayCommandId: "displayCommandId",
    examplePagesKey: "examplePagesInstalled",
    commands: {
        openMainMenu: `${maraudersMapPrefix}.accio`,
        openMapPage: `${maraudersMapPrefix}.iSolemnlySwearThatIAmUpToNoGood`,
        showMap: `${maraudersMapPrefix}.lumos`,
        closeMap: `${maraudersMapPrefix}.mischiefManaged`,
        goBack:  `${maraudersMapPrefix}.priorIncantato`,
        saveSpell: `${maraudersMapPrefix}.expectoPatronum`,
    },
};

//   Settings.json
// -----------------

function getDefaultValuesFromPackageJSON() {
    const packageJsonPath = path.join(__dirname, "..","..","package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const configs = packageJson.contributes.configuration.properties

    const defaultValues = {};
    Object.keys(configs).forEach(key => {
        defaultValues[key.split(".")[1]] = configs[key]
    })

    return defaultValues;
}

function getConfigValue(workspace, key) {
    return workspace.get(key, defaultValues[`${maraudersMapPrefix}.${key}`]);
}

function getConfigs() {
    const workspace = vscode.workspace.getConfiguration(
        maraudersMapPrefix
    );

    const configs = new Map();

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
    titleIcon: mapIcon,
    inputBoxTitle: `The Marauders Map ${mapIcon}`,
    prettifyKey,
    platform,
    isVSCodium
};


// |-----------------------|
// |        Feature        |
// |-----------------------|

// possible future settings:

// maraudersMap.ImADirtyMuggle: true => turn the Harry PotterNess off.
