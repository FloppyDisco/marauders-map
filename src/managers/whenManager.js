const vscode = require("vscode");
const Settings = require("../managers/settingsManager");

/**
 * serialize a mapPage into a when clause context for the keybindings
 * @param {string} mapPage the name of the Page
 * @returns {string} the when context to be used for the keybinding
 */
function serializer(mapPage) {
  return `${Settings.keys.maraudersMapPrefix}.${mapPage.replaceAll(" ", "_")}`;
}

// |------------------------------------------|
// |        WhenContexts for each Page        |
// |------------------------------------------|

let currentWhenContext;

/**
 * Sets the necessary "when" clause context functions for the Page.
 *
 * This function generates a formatted string for the when context based on the provided page title
 * and returns an object containing the whenContext string, a function to set the whenContext, and
 * a function to remove the whenContext.
 *
 * @param {string} mapPage - The title for this page of the map, used to generate the when context.
 * @returns {{whenContext: string, setWhenContext: function, removeWhenContext: function}} - An object containing:
 *   - `whenContext`: The formatted string to be used as the when context for this page.
 *   - `setWhenContext`: A function to set the necessary when contexts in VS Code.
 *   - `removeWhenContext`: A function to remove the necessary when contexts in VS Code.
 */
function initialize(mapPage) {

  const whenContext = serializer(mapPage);

  // |-----------------------------------------------------------|
  // |        Well ok, TECHNICALLY, this is the MAGIC ...        |
  // |-----------------------------------------------------------|

  //   Set The When Contexts
  // -------------------------

  // MaraudersMapIsOpen
  vscode.commands.executeCommand(
    "setContext",
    Settings.keys.mapOpenContext,
    true
  );

  // MapPage
  vscode.commands.executeCommand(
    "setContext",
    whenContext ? whenContext : "",
    true
  );


  /**
   * Removes the mapPage's "when" clause context.
   */
  const removeAllWhenContext = () => {
    vscode.commands.executeCommand(
      "setContext",
      Settings.keys.mapOpenContext,
      false
    );
    vscode.commands.executeCommand(
      "setContext",
      whenContext ? whenContext : "",
      false
    );
  };

  const removeMapPageWhenContext = () => {
    vscode.commands.executeCommand(
      "setContext",
      whenContext ? whenContext : "",
      false
    );
  }

  let _removed = false;
  const cleanUpCurrentWhenContexts = () => {
    if (currentWhenContext && currentWhenContext.whenContext === whenContext) {
      removeAllWhenContext();
      currentWhenContext._removed = true;
    }
  };
  currentWhenContext = {
    whenContext,
    removeWhenContext: removeAllWhenContext,
    _removed
  };


  return { whenContext, cleanUpCurrentWhenContexts, removeMapPageWhenContext };
}

function removePreviousContext() {
  if (currentWhenContext && !currentWhenContext._removed) {
    currentWhenContext.removeWhenContext();
    currentWhenContext = undefined;
  }
}



//   Selecting a Map Page
// ------------------------
/*
  When Opening the main menu of the Map
  ALL keybindings for opening a mapPage should be available

  A When context therefore is necessary to allow nested mapPages to be available
  from the main menu, even if they are not associated with their own mapPage with a keybinding
*/


function setSelectingMapPageContext() {
  vscode.commands.executeCommand(
    "setContext",
    Settings.keys.selectingMapPage,
    true
  );
}

function removeSelectingMapPageContext() {
  vscode.commands.executeCommand(
    "setContext",
    Settings.keys.selectingMapPage,
    false
  );
}



//   Map Visible
// ---------------

const setMapVisibleContext = () => {
  vscode.commands.executeCommand(
    "setContext",
    Settings.keys.mapVisibleContext,
    true,
  );
}

const removeMapVisibleContext = () => {
  vscode.commands.executeCommand(
    "setContext",
    Settings.keys.mapVisibleContext,
    false,
  );
}




module.exports = {
  initialize,
  serializer,
  removePreviousContext,
  setSelectingMapPageContext,
  removeSelectingMapPageContext,
  setMapVisibleContext,
  removeMapVisibleContext
};
