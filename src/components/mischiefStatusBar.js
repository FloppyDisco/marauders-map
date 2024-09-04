const vscode = require("vscode");
const { useConfigs, configKeys } = require("../managers/settingsManager");

let mischiefStatusBarItem;

/**
 * Function to create ans return the mischiefStatusBar
 * @returns {vscode.StatusBarItem} The mischiefStatusBar item
 */
function create() {
    const configs = useConfigs();

    if (mischiefStatusBarItem) { // exists remove the old one
        mischiefStatusBarItem.dispose();
    }
    mischiefStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        0
    );
    mischiefStatusBarItem.text = `${configs.get(
       configKeys.spellIcon
    )} Mischief Managed...`;
    mischiefStatusBarItem.show();
    setTimeout(() => {
        mischiefStatusBarItem.dispose();
    }, 1000);
    return mischiefStatusBarItem;
}

/**
 * Function to dispose of the mischiefStatusBar if it exists
 */
function removeIfExists() {
    if (mischiefStatusBarItem) { // exists remove the old one
        mischiefStatusBarItem.dispose();
        mischiefStatusBarItem = null;
    }
}


module.exports = {
    create,
    removeIfExists,
    component: mischiefStatusBarItem,
}
