const vscode = require("vscode");
const Settings = require("../managers/settingsManager");

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
    const configs = Settings.useConfigs();
    mapStatusBarItem = initStatusBarBase(mapStatusBarItem, {
        text: configs.get(Settings.keys.titleIcon),
        command: Settings.keys.commands.openMap,
        tooltip: "I solemnly swear that I am up to no good...",
        alignment: "Right",
    });
    return mapStatusBarItem;
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
    const configs = Settings.useConfigs();
    solemnlySwearStatusBarItem = initStatusBarBase(solemnlySwearStatusBarItem, {
        text: `${configs.get(Settings.keys.spellIcon)} I solemnly swear ...`,
        tooltip: "Sometimes spells go wonky, click to close!",
        command: Settings.keys.commands.closeMap,
        alignment: "Left",
    });
    return solemnlySwearStatusBarItem;
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
    const configs = Settings.useConfigs();
    pageStatusBarItem = initStatusBarBase(pageStatusBarItem, {
        text: `${configs.get(Settings.keys.spellIcon)} ${mapPage}`,
        command: Settings.keys.commands.closeMap,
        tooltip: "Sometimes spells go wonky, click to close!",
        alignment: "Left",
    });
    return pageStatusBarItem;
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
    const configs = Settings.useConfigs();
    mischiefStatusBarItem = initStatusBarBase(mischiefStatusBarItem, {
        text: `${configs.get(Settings.keys.spellIcon)} Mischief Managed...`,
        command: Settings.keys.commands.closeMap,
        tooltip: "Sometimes spells go wonky, click to close!",
        alignment: "Left",
    });
    setTimeout(() => {
        mischiefStatusBarItem.dispose();
    }, 1234);
    return mischiefStatusBarItem;
}
function useMischiefStatusBar() {
    return mischiefStatusBarItem;
}

function initialize(context) {
    context.subscriptions.push([
        pageStatusBarItem,
        solemnlySwearStatusBarItem,
        mischiefStatusBarItem,
        mapStatusBarItem,
    ])
}

function dispose() {
    if (pageStatusBarItem) { // exists
        pageStatusBarItem.dispose();
    }
    if (solemnlySwearStatusBarItem) { // exists
        solemnlySwearStatusBarItem.dispose();
    }
    if (mischiefStatusBarItem) { // exists
        mischiefStatusBarItem.dispose();
    }
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
    initialize,
    dispose,
};
