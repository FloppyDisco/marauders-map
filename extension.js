// managers
const Settings = require("./src/managers/settingsManager");
const StatusBars = require("./src/managers/statusBarManager");

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
    // get configs
    Settings.initialize(context);
    StatusBars.initialize(context);

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
    examplePages.initialize(context);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
