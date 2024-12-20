const vscode = require("vscode");

// managers
const Settings = require("../managers/settingsManager");
const Notifications = require("../managers/notificationsManager");
const Picks = require("../managers/quickPickManager");
const Prompts = require("../managers/promptManager");
const StatusBars = require("../managers/statusBarManager");
const Keybindings = require("../managers/keybindingsManager");
const When = require("../managers/whenManager");

// |---------------------|
// |        Accio        |
// |---------------------|

function register(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Settings.keys.commands.openMainMenu,
      async () => {

        StatusBars.dispose();

        When.setSelectingMapPageContext()

        const solemnlySwearStatusBar = StatusBars.solenmlySwear.initialize();
        solemnlySwearStatusBar.show();

        function exit() {
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
              command: Settings.keys.commands.openMapPage,
              when: `!${Settings.keys.mapIsActive}`,
              args: {
                mapPage,
              },
            };
            await Keybindings.saveKeybindings([keybinding])
            .then(result => Notifications.newPage(keybinding))
            .catch(error => exit())
          }
        } else {
          mapPage = selection.args.mapPage || selection.args.args.mapPage;
        }

        //   Page Selected
        // -----------------
        if(mapPage){
          vscode.commands.executeCommand(Settings.keys.commands.openMapPage, {
            mapPage,
            mapDelay: 0,
          });
        }
      }
    )
  );
}

module.exports = {
  register,
};
