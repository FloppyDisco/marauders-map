const vscode = require('vscode');
const { useConfigs } = require("../managers/settingsManager");

let solemnlySwearStatusBarItem;

/**
 * Function to create and return the mischiefStatusBar
 * @returns {vscode.StatusBarItem} The mischiefStatusBar item
 */
function create() {
    const configs = useConfigs();

    if (solemnlySwearStatusBarItem) { // exists remove the old one
        solemnlySwearStatusBarItem.dispose();
    }
    solemnlySwearStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        0
    );
    solemnlySwearStatusBarItem.text = `${configs.get(
       configKeys.spellIcon
    )} I solemnly swear ...`;
    solemnlySwearStatusBarItem.show();
    return solemnlySwearStatusBarItem;
}

/**
 * Function to dispose of the mischiefStatusBar if it exists
 */
function removeIfExists() {
    if (solemnlySwearStatusBarItem) { // exists remove the old one
        solemnlySwearStatusBarItem.dispose();
    }
}


module.exports = {
    create,
    removeIfExists,
    component: solemnlySwearStatusBarItem,
    // may need to return the status bar item directly to dispose of within the function
}
