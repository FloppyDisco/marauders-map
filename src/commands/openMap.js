const vscode = require("vscode");

// managers
const Settings = require("../managers/settingsManager");
const Notifications = require("../managers/notificationsManager");
const Picks = require("../managers/quickPickManager");
const Keybindings = require("../managers/keybindingsManager");
const StatusBars = require("../managers/statusBarManager");
const When = require("../managers/whenManager");

const createNewSpellKeybinding = require("../createNewSpellKeybinding");

// |----------------------------------------------------------|
// |        I Solemnly Swear That I Am Up To No Good ...      |
// |----------------------------------------------------------|


function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Settings.keys.commands.openMapPage,
      async ({ mapPage, mapDelay, showMap, isNestedPage } = {}) => {
        //console.log('---------- openMap()');

        StatusBars.dispose();
        if (!mapPage) {
          vscode.commands.executeCommand(Settings.keys.commands.openMainMenu);
          return; // exit
        }

        // Set the When Context
        const {removePageContext, removeMapIsActiveContext } = When.activatePage(mapPage);

        //   Display Page status bar
        const pageStatusBar = StatusBars.page.initialize(mapPage);
        pageStatusBar.show();

        function exit() {
          //console.log('exiting selectSpell()');
          pageStatusBar.dispose();
          removePageContext();
          removeMapIsActiveContext();
        }

        const spellKeybindings =
          Keybindings.getSpellKeybindingsForPage(mapPage);
        const spells = Picks.createSpellMenuItems(spellKeybindings, {
          mapPage,
        });

        //   Show the map and select a spell
        // -----------------------------------

        const selection = await Picks.selectSpell({
          spells,
          mapPage,
          mapDelay,
          showMap,
          isNestedPage
        });
        if (selection === undefined) {
          return exit();
        }

        if (selection.command === Picks.addSpellItem.command) {
          removePageContext();
          const newSpellKeybinding = await createNewSpellKeybinding(mapPage);
          if (newSpellKeybinding === undefined) {
            return exit();
          }

          const [newSpell] = Picks.createSpellMenuItems([newSpellKeybinding], {
            includeButtons: false,
          });

          let orderedSpells;
          if (spells.length > 0) {
            orderedSpells = await Picks.selectOrder({
              spells,
              spellToMove: newSpell,
              mapPage,
            });
            if (orderedSpells === undefined) {
              return exit();
            }
          } else {
            orderedSpells = [newSpell];
          }
          Picks.updateSpellsOnPage(orderedSpells);
          Notifications.newSpell(newSpellKeybinding);
          exit();

        } else {

          // |---------------------------------|
          // |        The MAGIC is here        |
          // |---------------------------------|

          exit();
          vscode.commands.executeCommand(selection.command, selection.args);
        }
      }
    )
  );
}

module.exports = {
  register,
};
