const vscode = require("vscode");
const settings = require("../managers/settingsManager");

function initStatusBarBase(
    statusBar,
    { text, alignment, command, tooltip } = {}
) {
    if (statusBar) {
        // exists, remove the old one
        statusBar.dispose();
    }
    statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment[alignment],
        0
    );
    statusBar.text = text;
    statusBar.command = command;
    statusBar.tooltip = tooltip;
    return statusBar;
}

// |-----------------------------------|
// |        Map Status Bar Item        |
// |-----------------------------------|

let mapStatusBarItem;

/**
 * A function to initialize the mapStatusBar item
 */
function initMapStatusBar() {
    const configs = settings.useConfigs();
    return initStatusBarBase(mapStatusBarItem, {
        text: configs.get(settings.keys.titleIcon),
        command: settings.keys.commands.openMap,
        tooltip: "I solemnly swear that I am up to no good...",
        alignment: "Right",
    });
}
function useMapStatusBar() {
    return mapStatusBarItem;
}

// |----------------------------------------------|
// |        Solemnly Swear Status Bar Item        |
// |----------------------------------------------|

let solemnlySwearStatusBarItem;

/**
 * Function to create and return the mischiefStatusBar
 * @returns {vscode.StatusBarItem} The mischiefStatusBar item
 */
function initSolemnlySwearStatusBar() {
    const configs = settings.useConfigs();
    return initStatusBarBase(solemnlySwearStatusBarItem, {
        text: `${configs.get(settings.keys.spellIcon)} I solemnly swear ...`,
        command: settings.keys.commands.closeMap, // might cause an issue with no command?
        alignment: "Left",
    });
}
function useSolemnlySwearStatusBar() {
    return solemnlySwearStatusBarItem;
}

// |------------------------------------|
// |        Page Status Bar Item        |
// |------------------------------------|

let pageStatusBarItem;

/**
 * Function to create and return the pageStatusBar
 * @param   {string} mapPage The title for this Page of the Map
 * @returns {vscode.StatusBarItem} The pageStatusBar item
 */
function initPageStatus(mapPage) {
    const configs = settings.useConfigs();
    return initStatusBarBase(pageStatusBarItem, {
        text: `${configs.get(settings.keys.spellIcon)} ${mapPage}`,
        command: settings.keys.commands.closeMap,
        tooltip: "Sometimes spells go wonky, click to close!",
        alignment: "Left",
    });
}
function usePageStatusBar() {
    return pageStatusBarItem;
}

// |----------------------------------------|
// |        Mischief Status Bar Item        |
// |----------------------------------------|

let mischiefStatusBarItem;

/**
 * Function to create and return the "mischief managed" status bar item
 * @returns {vscode.StatusBarItem} The mischiefStatusBar item
 */
function initMischiefStatusBar() {
    const configs = settings.useConfigs();
    const statusBar = initStatusBarBase(mischiefStatusBarItem, {
        text: `${configs.get(settings.keys.spellIcon)} Mischief Managed...`,
        command: settings.keys.commands.closeMap,
        tooltip: "Sometimes spells go wonky, click to close!",
        alignment: "Left",
    });
    setTimeout(() => {
        statusBar.dispose();
    }, 1122);
    return statusBar;
}
function useMischiefStatusBar() {
    return mischiefStatusBarItem;
}

module.exports = {
    solenmlySwear: {
        initialize: initSolemnlySwearStatusBar,
        use: useSolemnlySwearStatusBar,
    },
    page: {
        initialize: initPageStatus,
        use: usePageStatusBar,
    },
    mischief: {
        initialize: initMischiefStatusBar,
        use: useMischiefStatusBar,
    },
    mapIcon: {
        initialize: initMapStatusBar,
        use: useMapStatusBar,
    },
};