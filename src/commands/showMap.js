const vscode = require("vscode");

// managers
const Settings = require("../managers/settingsManager");
const Picks = require("../managers/quickPickManager");
const Prompts = require("../managers/promptManager");
const StatusBars = require("../managers/statusBarManager");
const Keybindings = require("../managers/keybindingsManager");
const When = require("../managers/whenManager");

// |---------------------|
// |        Lumos        |
// |---------------------|

function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Settings.keys.commands.showMap,
      async () => {
        // console.log("------------- showMap() -----------");

        StatusBars.dispose();

        When.setSelectingMapPageContext()

        const solemnlySwearStatusBar = StatusBars.solenmlySwear.initialize();
        solemnlySwearStatusBar.show();

        function closeMap() {
          When.removeSelectingMapPageContext()
          solemnlySwearStatusBar.dispose();
        }

        const PagesKeybindings = Keybindings.getAllPages();
        const pages = Picks.createPageMenuItems(PagesKeybindings);

        let mapPage;
        const selection = await Picks.selectPage({
          pages,
        });
        if (selection === undefined) {
          return closeMap(); // exit on 'Esc' key

        } else if (selection.command === Picks.addPageItem.command) {
          // create a new mapPage keybinding
          mapPage = await Prompts.promptUserForNewPageName();
          if (mapPage === undefined) {
            return closeMap(); // exit on 'Esc' key
          }

          const selectedKey = await Prompts.promptUserForKey({mapPage});
          if (selectedKey === undefined) {
            return closeMap(); // exit on 'Esc' key
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
          mapPage = selection.args.mapPage || selection.args.args.mapPage;
        }

        //   Page Selected
        // -----------------
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
