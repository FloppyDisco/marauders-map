const vscode = require("vscode");

// managers
const settings = require("./settingsManager");
const keybindingsMgr = require("./keybindingsManager");
const statusBarMgr = require("./statusBarManager");

let maraudersMap;
let mapOpenTimer;

/**
 * Function to create and return the maraudersMap
 * @returns {vscode.QuickPick} The maraudersMap quick pick
 */
function initialize({ mapPage, whenContext, removeWhenContext }) {
  if (maraudersMap) {
    // exists
    maraudersMap.dispose();
  }

  const configs = settings.useConfigs();

  //   Create Map
  // --------------

  maraudersMap = vscode.window.createQuickPick();

  maraudersMap.placeholder = "Choose your spell...";

  // call trigger functions when buttonr are clicked
  maraudersMap.onDidTriggerItemButton((event) => event.button.trigger());
  maraudersMap.onDidTriggerButton((event) => event.trigger());

  const mapPages = keybindingsMgr.getAllPages()
  const keybinding = mapPages.find((kb) => kb.args.mapPage === mapPage)

  // save trigger function to map so button trigger may be called even if button is no visible
  maraudersMap.editPageButtonTrigger = () => {keybindingsMgr.revealKeybinding(keybinding)}

  const displayTitle = configs.get(settings.keys.displayMapTitle);
  if (displayTitle) {
    maraudersMap.title = `${configs.get(settings.keys.titleIcon)} ${mapPage}`;
    // button will not be visible if displayTitle is false
    maraudersMap.buttons = [
      {
        ...settings.buttons.editPage,
        // add trigger function to button
        trigger: () => {maraudersMap.editPageButtonTrigger()},
      }
    ]
  }

  // |-----------------------|
  // |        Feature        |
  // |-----------------------|
  // go back page button for nested pages?
  // maraudersMap.buttons= [];

  maraudersMap.onDidHide(() => {
    removeWhenContext();
    maraudersMap.dispose();
    statusBarMgr.page.use().dispose();
  });

  maraudersMap.onDidChangeSelection(([selection]) => {
    //   Magic Sauce Is HERE
    // -----------------------
    removeWhenContext();
    maraudersMap.dispose();
    statusBarMgr.page.use().dispose();
    vscode.commands.executeCommand(
      // well ok, it's here...
      selection.command,
      selection.args
    );
  });

  //   Get Keybindings
  // -------------------

  const keybindings = keybindingsMgr.getKeybindingsForPage(whenContext);

  const spells = keybindingsMgr.convertToItems(keybindings);

  maraudersMap.items = [
    ...spells,
    {
      label: "$(add) New Spell",
      command: settings.keys.commands.saveSpell,
      args: { mapPage },
      alwaysShow: true,
    },
  ];
}

function openMap({ mapDelay, selectedPageManually }) {
  const configs = settings.useConfigs();

  const mapDelayTime =
    mapDelay !== undefined
      ? mapDelay
      : configs.get(settings.keys.defaultMapDelay);

  if (!selectedPageManually && mapDelayTime) {
    mapOpenTimer = setTimeout(() => {
      // show map after delay
      if (maraudersMap && !maraudersMap._visible) {
        maraudersMap.show();
      }
    }, mapDelayTime);
  } else {
    // map delay is zero, show map!
    maraudersMap.show();
  }
}

function use() {
  return maraudersMap;
}

async function selectOrder() {
  maraudersMap.placeholder = "What Spell shall the separator go above?";
  return new Promise((resolve) => {
    maraudersMap.onDidChangeSelection(([selection]) => {
      if (selection) {
        resolve(
          maraudersMap.items.findIndex((item) => item.label === selection.label)
        );
      } else {
        resolve(undefined);
      }
      maraudersMap.dispose();
    });
    maraudersMap.onDidHide(() => {
      maraudersMap.dispose();
      resolve(undefined);
    });
    maraudersMap.show();
  });
}

function clean() {
  if (maraudersMap) {
    maraudersMap.dispose();
  }
}

function cancelTimer() {
  clearTimeout(mapOpenTimer);
}

module.exports = {
  initialize,
  openMap,
  use,
  selectOrder,
  clean,
  cancelTimer,
};
