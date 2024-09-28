const vscode = require("vscode");
const Settings = require("../managers/settingsManager");


let allWhenContexts = [];

function serializer(mapPage) {
  return `${Settings.keys.maraudersMapPrefix}.${mapPage.replaceAll(" ", "_")}`;
}

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

  /**
   * Sets the page's "when" clause context.
   */
  const setWhenContext = () => {

    // |-----------------------------------------------------------|
    // |        Well ok, TECHNICALLY, this is the MAGIC ...        |
    // |-----------------------------------------------------------|

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
  };

  /**
   * Removes the page's "when" clause context.
   */
  const removeWhenContext = () => {
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

  const context = { whenContext, setWhenContext, removeWhenContext };
  allWhenContexts.push(context)
  return context
}

function removeAllContexts(){
  allWhenContexts.forEach(context => context.removeWhenContext());
}


module.exports = {
  initialize,
  serializer,
  removeAllContexts
};
