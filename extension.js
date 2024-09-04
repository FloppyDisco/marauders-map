const vscode = require("vscode");

// managers
const settings = require("./src/managers/settingsManager");

// commands
const openMap = require("./src/commands/openMap");
const closeMap = require("./src/commands/closeMap");
const showMap = require("./src/commands/showMap");
const saveSpell = require("./src/commands/saveSpell");

// components
const mapStatusBar = require("./src/components/mapStatusBar");

// keybindings
const examplePages = require("./src/examplePages");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // get configs
    settings.initialize(); // must initialize to register the event listener

    // create UI
    mapStatusBar.initialize(); // display the extension icon

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
