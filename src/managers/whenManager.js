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
 * Creates the necessary "when" clause context functions for the Page.
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

  //   Set the WhenContext for the page
  // ------------------------------------

  // console.log("setting when context: ", whenContext);
  vscode.commands.executeCommand(
    "setContext",
    Settings.keys.mapOpenContext,
    true
  );
  vscode.commands.executeCommand(
    "setContext",
    whenContext ? whenContext : "",
    true
  );


  /**
   * Removes the page's "when" clause context.
   */
  const removeWhenContext = () => {
    // console.log("removing when context: ", whenContext);

    vscode.commands.executeCommand(
      "setContext",
      Settings.keys.mapOpenContext,
      undefined
    );
    vscode.commands.executeCommand(
      "setContext",
      whenContext ? whenContext : "",
      undefined
    );
  };

  let _removed = false;

  const cleanUpWhenContext = () => {
    if (currentWhenContext && currentWhenContext.whenContext === whenContext) {
      removeWhenContext();
      currentWhenContext._removed = true;
    }
  };

  currentWhenContext = {
    whenContext,
    removeWhenContext,
    _removed
  };

  const context = { whenContext, cleanUpWhenContext };
  return context;
}

function removePreviousContext() {
  if (currentWhenContext && !currentWhenContext._removed) {
    currentWhenContext.removeWhenContext();
    currentWhenContext = undefined;
  }
}

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
    undefined
  );
}

module.exports = {
  initialize,
  serializer,
  removePreviousContext,
  setSelectingMapPageContext,
  removeSelectingMapPageContext,
};
