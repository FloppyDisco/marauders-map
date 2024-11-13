// managers
const Settings = require("./src/managers/settingsManager");
const StatusBars = require("./src/managers/statusBarManager");
const Keybindings = require("./src/managers/keybindingsManager");
const Picks = require("./src/managers/quickPickManager");

// commands
const openMainMenu = require("./src/commands/openMainMenu");
const openMap = require("./src/commands/openMap");
const showMap = require("./src/commands/showMap");
const closeMap = require("./src/commands/closeMap");
const goBack = require("./src/commands/goBack");
const revealKeybinding = require("./src/commands/revealKeybinding");

// keybindings
const examples = require("./src/examples");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // setup
    Settings.initialize(context);
    StatusBars.initialize(context);
    Keybindings.initialize(context);
    Picks.initialize(context);

    // register commands
    openMainMenu.register(context);
    openMap.register(context);
    showMap.register(context);
    closeMap.register(context);
    goBack.register(context);
    revealKeybinding.register(context);

    // create UI
    StatusBars.mapIcon.initialize().show();

    // install examples
    examples.initialize(context);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
