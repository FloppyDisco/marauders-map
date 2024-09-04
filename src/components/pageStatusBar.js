

const vscode = require("vscode");
const { useConfigs, configKeys } = require("../managers/settingsManager");

let pageStatusBarItem;

/**
 * Function to create and return the pageStatusBar
 * @param   {string} mapPage The title for this Page of the Map
 * @returns {vscode.StatusBarItem} The pageStatusBar item
 */
function create(mapPage) {
    const configs = useConfigs();

    if (pageStatusBarItem) { // exists remove the old one
        pageStatusBarItem.dispose();
    }

    pageStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        0
    );
    pageStatusBarItem.tooltip =
        "Sometimes spells go wonky, click to close!";
    pageStatusBarItem.command = configKeys.commads.closeMap;
    pageStatusBarItem.text = `${configs.get(
       configKeys.spellIcon
    )} ${mapPage}`;

    return pageStatusBarItem;
}

/**
 * Function to dispose of the mischiefStatusBar if it exists
 */
function removeIfExists() {
    if (pageStatusBarItem) { // exists remove the old one
        pageStatusBarItem.dispose();
        pageStatusBarItem = null;
    }
}


module.exports = {
    create,
    removeIfExists,
    component: pageStatusBarItem,
}
