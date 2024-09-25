const vscode = require("vscode");

// managers
const Settings = require("./settingsManager");
const Keybindings = require("./keybindingsManager");
const Prompts = require("./promptManager");
const StatusBars = require("./statusBarManager");
const When = require("./whenManager");

let maraudersMap;
let mapOpenTimer;
let selectedPageManually = false;

let onDidAccept;
let onDidChangeValue;
let onDidChangeSelection;
let onDidChangeActive;
let onDidHide;

// |----------------------------------|
// |        Initialize the Map        |
// |----------------------------------|

/**
 * Function to create and return the maraudersMap
 * @returns {vscode.QuickPick} The maraudersMap quick pick
 */
function initialize({ mapPage, separators, mapDelay }) {

  console.log('selectedPageManually',selectedManually());


  if (maraudersMap) {
    // exists
    maraudersMap.dispose();
  }

  const configs = Settings.useConfigs();
  const { whenContext } = When.use();

  //   Create Map
  // --------------
  maraudersMap = vscode.window.createQuickPick();

  //   Props
  // ---------
  maraudersMap.placeholder = "Choose your spell...";
  // call trigger functions when buttons are clicked
  maraudersMap.onDidTriggerItemButton((event) => event.button.trigger());
  maraudersMap.onDidTriggerButton((event) => event.trigger());

  //   TitleBar
  // ------------

  const displayTitle = configs.get(Settings.keys.displayMapTitle);
  if (displayTitle) {
    maraudersMap.title = `${configs.get(Settings.keys.titleIcon)} ${mapPage}`;

    const mapPages = Keybindings.getAllPages();
    const keybinding = mapPages.find((kb) => kb.args.mapPage === mapPage);
    maraudersMap.mapPageKeybinding = keybinding;

    maraudersMap.buttons = [
      {
        ...Settings.buttons.editPage,
        trigger: () => {
          Keybindings.revealKeybinding(keybinding);
        },
      },
    ];
  }

  // |-----------------------|
  // |        Feature        |
  // |-----------------------|
  // go back page button for nested pages?
  // maraudersMap.buttons= [];

  onDidHide = maraudersMap.onDidHide(() => {
    disposeMap();
  });

  //   add Menuitems to QuickPick
  // ------------------------------

  const keybindings = Keybindings.getKeybindingsForPage(whenContext);

  const spells = createMenuItems(keybindings);

  // add separators from mapPage args
  for (const index in separators) {
    spells.splice(index, 0, createSeparator(separators[index]));
  }

  maraudersMap.spells = spells;
  const addSpell = {
    label: "$(add) New Spell",
    command: "addNewSpell",
    alwaysShow: true,
  };

  maraudersMap.items = [
    ...maraudersMap.spells,
    createSeparator(),
    addSpell
  ];

  onDidAccept = maraudersMap.onDidAccept(() => {
    //   Magic Sauce Is HERE
    // -----------------------

    const [selection] = maraudersMap.activeItems;

    if (selection.command === addSpell.command) {
      addNewSpell();
    } else {
      disposeMap();
      vscode.commands.executeCommand(
        // well ok, it's here...
        selection.command,
        selection.args
      );
    }
  });

  const mapDelayTime =
    mapDelay !== undefined
      ? mapDelay
      : configs.get(Settings.keys.defaultMapDelay);



  console.log('selectedManually()',selectedManually());

  console.log('mapDelayTime',mapDelayTime);






  if (!selectedManually() || mapDelayTime) {
    console.log('setting delay',);

    mapOpenTimer = setTimeout(() => {
      // show map after delay
      if (maraudersMap && !maraudersMap._visible) {
        maraudersMap.show();
      }
    }, mapDelayTime);
  } else {
    console.log('showing map',);

    selectedPageManually = false;
    // map delay is zero, show map!
    maraudersMap.show();
  }
}

async function addNewSpell() {
  cleanMap();
  maraudersMap.hide();

  let newSpell;

  let selectedArgs;
  let nestedPage;
  let selectedLabel;
  let selectedKey;

  let needLabel;
  let needKey;
  let needPage;
  let isSeparator;

  const selectedCommand = await Prompts.promptUserForCommand();

  switch (selectedCommand) {
    case undefined:
      disposeMap();
      return; // exit on 'Esc' key

    case Settings.keys.commands.openMap:
      //   User selected a nested Page
      // -------------------------------
      needPage = true;
      needKey = true;
      selectedLabel = undefined;
      break;

    case "separator":
      //   User selected a separator
      // -----------------------------
      isSeparator = true;
      needLabel = true;
      break;

    default:
      //   User is adding a command Spell
      // ----------------------------------
      needKey = true;
      needLabel = true;
      break;
  }

  if (needPage) {
    const PagesKeybindings = Keybindings.getAllPages();
    const pageMenuItems = createMenuItems(PagesKeybindings);

    // ask which Page this command will go to =>
    nestedPage = await Prompts.promptUserToSelectPage({ pageMenuItems });
    if (nestedPage === undefined) {
      disposeMap();
      return; // exit on 'Esc' key
    }

    selectedArgs = {
      mapPage: nestedPage,
    };
  }

  if (needKey) {
    selectedKey = await Prompts.promptUserForKey();
    if (selectedKey === undefined) {
      disposeMap();
      return; // exit on 'Esc' key
    }
  }

  if (needLabel) {
    selectedLabel = await Prompts.promptUserForLabel(selectedCommand);
    if (selectedLabel === undefined) {
      disposeMap();
      return; // exit on 'Esc' key
    }
  }

  newSpell = isSeparator
    ? createSeparator(selectedLabel)
    : {
        key: selectedKey ? selectedKey : undefined, // set to undefined for serialization
        command: Settings.keys.commands.closeMap,
        when: When.use().whenContext,
        args: {
          command: selectedCommand,
          label: selectedLabel,
          args: selectedArgs,
        },
      };



  const orderedSpells = await selectOrder(newSpell);
  if (orderedSpells === undefined) {
    disposeMap();
    return; // exit on 'Esc' key
  }

  disposeMap();
  updatePageSpells(orderedSpells);
}

// |--------------------------------------|
// |        Select Map Items Order        |
// |--------------------------------------|

async function selectOrder(newSpell) {
  cleanMap();

  const isSeparator = newSpell.kind === vscode.QuickPickItemKind.Separator;

  if (!isSeparator) {
    [newSpell] = createMenuItems([newSpell]);
  }

  maraudersMap.placeholder = "Where does the Spell go?";
  maraudersMap.keepScrollPosition = true;



  let savedSpells = maraudersMap.spells.filter((item) =>
    // remove the spell if reordering a pre-existing spell
    item.label !== newSpell.label
    && item.description !== newSpell.description
  ).map((item) => ({
    ...item,
    alwaysShow: true,
    buttons: [],
  }));


  // if this is the first spell on a page, don't ask the user for an order
  if (savedSpells.length === 0){
    // disposeMap();
    return [newSpell];
  }

  // prevent user typing from hiding items
  onDidChangeValue = maraudersMap.onDidChangeValue(
    () => (maraudersMap.value = "")
  );

  function insertNewSpell(index) {
    maraudersMap.items = savedSpells.toSpliced(index, 0, newSpell);
  }

  const endOfList = savedSpells.length;

  if (isSeparator) {
    insertNewSpell(0);
  } else {
    insertNewSpell(endOfList);
    maraudersMap.activeItems = [newSpell];
  }

  function findItem(item, searchItem) {
    for (const key in searchItem) {
      if (item[key] !== searchItem[key]) {
        return false;
      }
    }
    return true;
  }

  let updatingMenuItems = true;
  let prevActiveIndex = 0;

  onDidChangeActive = maraudersMap.onDidChangeActive(() => {
    if (updatingMenuItems) {
      setTimeout(() => {
        updatingMenuItems = false;
      }, 100);
      return; // prevent loop
    }
    updatingMenuItems = true;

    const [activeItem] = maraudersMap.activeItems;
    const activeIndex = maraudersMap.items.findIndex((item) =>
      findItem(item, activeItem)
    );

    if (isSeparator) {
      const movingDown = activeIndex > prevActiveIndex;
      const insertAt =
        activeIndex === 0 ? 0 : movingDown ? activeIndex - 1 : activeIndex + 1;

      insertNewSpell(insertAt);
      maraudersMap.activeItems = [
        maraudersMap.items[activeIndex === 0 ? 1 : activeIndex],
      ];

      prevActiveIndex = activeIndex;
    } else {
      insertNewSpell(activeIndex);
      maraudersMap.activeItems = [newSpell];
    }

    setTimeout(() => {
      updatingMenuItems = false;
    }, 100);
  });

  return new Promise((resolve) => {
    onDidAccept = maraudersMap.onDidAccept(() => {
      const spells = maraudersMap.items;
      resolve(spells);
      // disposeMap();
    });
    maraudersMap.onDidHide(() => {
      resolve(undefined);
      // disposeMap();
    });
    maraudersMap.show();
  });
}

// |-------------------------------------------------|
// |        update keybindings with new Order        |
// |-------------------------------------------------|

function updatePageSpells(spells) {
  const keybindingsToSave = [];
  const separators = {};

  spells.forEach((spell, index) => {
    const isSeparator =
      "kind" in spell && spell.kind === vscode.QuickPickItemKind.Separator;

    if (isSeparator) {
      separators[index] = spell.label;

    } else {
      keybindingsToSave.push({
        key: spell.key,
        command: spell.command,
        when: spell.when,
        args: {
          ...spell.args,
          order: index,
        },
      });
    }
  });


  // if this is not a nestedPage
  // save the page keybinding

  // |---------------------|
  // |        *BUG*        |
  // |---------------------|

  // cannot save separators to nested pages
  // what if a page is nested and not nested
  // where are the separators stored?

  // for now the separators would need to be stored on the nested page args


  if (maraudersMap.mapPageKeybinding){
     // if a keybinding is saved, it is not a nested page
    keybindingsToSave.push({
      ...maraudersMap.mapPageKeybinding,
      args: {
        ...maraudersMap.mapPageKeybinding.args,
        separators,
      },
    });
  }

  Keybindings.saveKeybindings(keybindingsToSave);
}

function createSeparator(label) {
  return {
    label,
    kind: vscode.QuickPickItemKind.Separator,
  };
}

function createMenuItems(keybindings) {
  const configs = Settings.useConfigs();

  return keybindings
    .sort((a, b) => {

      const aArgs = a.args;
      const bArgs = b.args;

      const aHasOrder = aArgs && "order" in aArgs;
      const bHasOrder = bArgs && "order" in bArgs;

      if (aHasOrder && bHasOrder) {
        return  aArgs.order-bArgs.order;
      } else if (aHasOrder && !bHasOrder) {
        return -1;
      } else if (!aHasOrder && bHasOrder) {
        return 1;
      } else {
        return -1;
      }
    })
    .map(convertKeybinding);

  function convertKeybinding(keybinding) {
    const args = keybinding.args;
    let label;
    let description;

    if (keybinding.command === Settings.keys.commands.closeMap) {
      //   Keybinding is a Spell on a Page
      // -----------------------------------

      if (args.command === Settings.keys.commands.openMap) {
        //   Keybinding is a nested Page
        // -------------------------------

        label = `   ${configs.get(Settings.keys.subpageIcon)} Go to ${
          args.args.mapPage
        } ...`;
        description = `${Settings.prettifyKey(keybinding.key)}`;
      } else {
        //   keybinding is a spell
        // -------------------------

        label = `${configs.get(Settings.keys.spellIcon)} ${
          args.label ? args.label : args.command
        }`;
        description = `${Settings.prettifyKey(keybinding.key)}  ${
          // if displayCommandId and there is a label
          configs.get(Settings.keys.displayCommandId) && args.label
            ? // show the command id
              args.command
            : ""
        }`;
      }
    } else if (keybinding.command === Settings.keys.commands.openMap) {
      //   keybinding is a page
      // ------------------------

      label = `${configs.get(Settings.keys.pageIcon)} ${args.mapPage}`;
      description = Settings.prettifyKey(keybinding.key);
    }

    const buttons = [
      {
        ...Settings.buttons.moveSpell,
        trigger: async () => {
          const orderedSpells = await selectOrder(keybinding)
          if (orderedSpells === undefined){
            disposeMap();
          }
          updatePageSpells(orderedSpells);

          // |-----------------------|
          // |        Feature        |
          // |-----------------------|
          // instead of disposing the map, reset the map to handle more input
          // this will require abstracting the init interactions to a function that can be called

          disposeMap();
        },
      },
      {
        ...Settings.buttons.editSpell,
        trigger: () => {
          Keybindings.revealKeybinding(keybinding);
        },
      },
    ];

    /*
    keybinding:

   {
      "key": "cmd+,",
      "command": "MaraudersMap.mischiefManaged",
      "when" : "MaraudersMap.Editor",
      "args": {
          "label": "Split Editor Down"
          "command": "editor.splitDown",
          "order": 1
      }
  },
    "label": "decorated label",
    "description": "decorated description",
    "buttons":[],
*/

    const menuItem = {
      ...keybinding,
      label,
      description,
      buttons,
    };

    return menuItem;
  }
}

function use() {
  return maraudersMap;
}

function selectedManually(){
  return selectedPageManually;
}

function disposeMap() {
  if (maraudersMap) {
    cleanMap();
    maraudersMap.dispose();
  }

  When.use().removeWhenContext();

  const pageStatusBar = StatusBars.page.use();
  if (pageStatusBar) {
    pageStatusBar.dispose();
  }
}

function cleanMap() {
  if (maraudersMap) {
    maraudersMap.value = "";
  }
  if (onDidAccept) {
    onDidAccept.dispose();
  }
  if (onDidChangeValue) {
    onDidChangeValue.dispose();
  }
  if (onDidChangeSelection) {
    onDidChangeSelection.dispose();
  }
  if (onDidChangeActive) {
    onDidChangeActive.dispose();
  }
  if (onDidHide) {
    onDidHide.dispose();
  }
}

function cancelTimer() {
  clearTimeout(mapOpenTimer);
}

module.exports = {
  initialize,
  selectOrder,
  updatePageSpells,
  createMenuItems,
  createSeparator,
  use,
  selectedPageManually,
  dispose: disposeMap,
  cancelTimer,
};
