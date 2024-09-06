// managers
const settings = require("./src/managers/settingsManager");
const statusBarMgr = require("./src/managers/statusBarManager");

// commands
const openMap = require("./src/commands/openMap");
const closeMap = require("./src/commands/closeMap");
const showMap = require("./src/commands/showMap");
const saveSpell = require("./src/commands/saveSpell");


// keybindings
const examplePages = require("./src/examplePages");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // get configs
    settings.initialize(context); // must initialize to register the event listener

    // create UI
    statusBarMgr.register(context);
    statusBarMgr.mapIcon.initialize().show() // display the extension icon

    // register commands
    openMap.register(context);
    closeMap.register(context);
    saveSpell.register(context);
    showMap.register(context); // i don't think this command is being used anywhere

    // install default spells
    examplePages.initialize(context);
} // end of activate

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
