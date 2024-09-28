// managers
const Settings = require("./src/managers/settingsManager");
const StatusBars = require("./src/managers/statusBarManager");
const Keybindings = require("./src/managers/keybindingsManager");

// commands
const showMap = require("./src/commands/showMap");
const openMap = require("./src/commands/openMap");
const closeMap = require("./src/commands/closeMap");

const saveSpell = require("./src/commands/saveSpell");
const editPage = require("./src/commands/editPage");
const editSpell = require("./src/commands/editSpell");


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

    // create UI
    StatusBars.mapIcon.initialize().show();

    // register commands
    showMap.register(context);
    openMap.register(context);
    closeMap.register(context);

    // saveSpell.register(context);

    // editPage.register(context);
    // editSpell.register(context);


    // install default spells
    // examplePages.initialize(context);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
