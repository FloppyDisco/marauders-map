const vscode = require("vscode");

// managers
const Settings = require("../managers/settingsManager");
const Picks = require("../managers/quickPickManager");
const Prompts = require("../managers/promptManager");
const StatusBars = require("../managers/statusBarManager");
const Keybindings = require("../managers/keybindingsManager");


// |---------------------|
// |        Lumos        |
// |---------------------|

function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Settings.keys.commands.showMap,
      async () => {
        console.log("------------- showMap() -----------");

        // // set flag for opening immediately
        // Picks.selectedPageManually = true;

        // remove any old UI elements from previous spells
        Picks.dispose();
        StatusBars.dispose();
        const solemnlySwearStatusBar = StatusBars.solenmlySwear.initialize();
        solemnlySwearStatusBar.show();

        function exit() {
          Picks.dispose();
          solemnlySwearStatusBar.dispose();
        }

        const PagesKeybindings = Keybindings.getAllPages();

        const pages = Picks.createPageMenuItems(PagesKeybindings);

        let mapPage;
        const selection = await Picks.selectPage({
          pages,
        });
        if (selection === undefined) {
          return exit(); // exit on 'Esc' key

        } else if (selection.command === Picks.addPageItem.command) {
          // create a new mapPage keybinding
          mapPage = await Prompts.promptUserForNewPageName();
          if (mapPage === undefined) {
            return exit(); // exit on 'Esc' key
          }

          const selectedKey = await Prompts.promptUserForKey({mapPage});
          if (selectedKey === undefined) {
            return exit(); // exit on 'Esc' key
          }

          if (mapPage && selectedKey !== undefined) {
            const keybinding = {
              key: selectedKey ? selectedKey : undefined,
              command: Settings.keys.commands.openMap,
              when: `!${Settings.keys.mapOpenContext}`,
              args: {
                mapPage,
              },
            };
            Keybindings.saveKeybindings([keybinding]);
          }
        } else {
          mapPage = selection.args.mapPage;
        }

        //   Page Selected
        // -----------------
        exit(); // exit and open the selected Page
        vscode.commands.executeCommand(Settings.keys.commands.openMap, {
          mapPage,
          mapDelay: 0,
        });
      }
    )
  );
}

module.exports = {
  register,
};
