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

// keybindings
const examplePages = require("./src/examplePages");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // setup
    Settings.initialize(context);
    StatusBars.initialize(context);
    Keybindings.initialize(context);
    Picks.initialize(context);

    // create UI
    StatusBars.mapIcon.initialize().show();

    // register commands
    openMainMenu.register(context);
    openMap.register(context);
    showMap.register(context);
    closeMap.register(context);


    // install default spells
    // examplePages.initialize(context);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
