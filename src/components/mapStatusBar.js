const vscode = require('vscode');
const settings = require('../managers/settingsManager');

/**
 * A function to initialize the mapStatusBar item
 */
exports.initialize = () => {
    const configs = settings.useConfigs();
    const mapStatusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        0
    );
    mapStatusBar.text = configs.get(settings.keys.titleIcon); // mapIcon
    mapStatusBar.command = settings.keys.commands.openMap;
    mapStatusBar.tooltip = "I solemnly swear that I am up to no good..."
    mapStatusBar.show();
}
