const vscode = require('vscode');
const {useConfigs, configKeys} = require('../managers/settingsManager');

/**
 * A function to initialize the mapStatusBar item
 */
exports.initialize = () => {
    const configs = useConfigs();
    const mapStatusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        0
    );
    mapStatusBar.text = configs.get(configKeys.titleIcon); // mapIcon
    mapStatusBar.command = configKeys.commands.openMap;
    mapStatusBar.tooltip = "I solemnly swear that I am up to no good..."
    mapStatusBar.show();
}
