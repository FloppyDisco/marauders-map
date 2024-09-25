const vscode = require("vscode");
// managers
const Settings = require("../managers/settingsManager");
const Map = require("../managers/mapManager");
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
        // console.log('showMap()',);

        // remove any old UI elements from previous spells
        Map.dispose();
        Prompts.dispose();
        StatusBars.dispose();

        const solemnlySwearStatusBar = StatusBars.solenmlySwear.initialize();

        solemnlySwearStatusBar.show();

          //   Add Items
        // -------------
        const PagesKeybindings = Keybindings.getAllPages();
        const pageMenuItems = Map.createMenuItems(PagesKeybindings);


        // |-----------------------|
        // |        Feature        |
        // |-----------------------|

        // create a flag that when set will cause map to show immediately
        // even if called from keybinding
        Map.selectedPageManually = true;

        // must determine how to reset the flag after a command is run





        const mapPage = await Prompts.promptUserToSelectPage({pageMenuItems});
        if (mapPage === undefined) {
          return; // exit on 'Esc' key
        }

        //                                                Page       or        nestedPage
        const pageNames = PagesKeybindings.map(kb => kb.args.mapPage || kb.args.args.mapPage);

        if (!pageNames.includes(mapPage)){
          // create a new mapPage keybinding
          const selectedKey = await Prompts.promptUserForKey();
          if (selectedKey === undefined) {
            return undefined; // exit on 'Esc' key
          }

          if (mapPage && selectedKey) {
            const keybinding = {
              key: selectedKey,
              command: Settings.keys.commands.openMap,
              when: `!${Settings.keys.mapOpenContext}`,
              args: {
                mapPage,
              },
            };

            Keybindings.saveKeybindings([keybinding]);
          }
        }



        solemnlySwearStatusBar.dispose();


        console.log('Map.selectedPageManually',Map.selectedPageManually);
        
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
