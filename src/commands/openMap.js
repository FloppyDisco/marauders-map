const vscode = require("vscode");

// managers
const Settings = require("../managers/settingsManager");
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
      Settings.keys.commands.openMap,
      async ({ mapPage, mapDelay } = {}) => {
        StatusBars.dispose();
        if (!mapPage) {
          vscode.commands.executeCommand(Settings.keys.commands.showMap);
          return; // exit
        }

        //   Set the When Context
        const { cleanUpCurrentWhenContexts, removeMapPageWhenContext } = When.initialize(mapPage);

        //   Display Page status bar
        const pageStatusBar = StatusBars.page.initialize(mapPage);
        pageStatusBar.show();

        function closeMap() {
          cleanUpCurrentWhenContexts();
          pageStatusBar.dispose();
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
        });
        if (selection === undefined) {
          return closeMap();
        }

        if (selection.command === Picks.addSpellItem.command) {
          removeMapPageWhenContext()
          const newSpellKeybinding = await createNewSpellKeybinding(mapPage);
          if (newSpellKeybinding === undefined) {
            return closeMap();
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
              return closeMap();
            }
          } else {
            orderedSpells = [newSpell];
          }

          Picks.updateSpellsOnPage(orderedSpells);

          closeMap();

        } else {
          // command was selected!


          // |---------------------------------|
          // |        The MAGIC is here        |
          // |---------------------------------|

          closeMap();
          vscode.commands.executeCommand(selection.command, selection.args);
        }
      }
    )
  );
}

module.exports = {
  register,
};
