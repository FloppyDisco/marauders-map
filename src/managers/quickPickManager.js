const vscode = require("vscode");

// managers
const Settings = require("./settingsManager");
const Keybindings = require("./keybindingsManager");
const StatusBars = require("./statusBarManager");
const When = require("./whenManager");

let selectSpellQuickPick;
let selectPageQuickPick;
let selectOrderQuickPick;

let mapOpenTimer;

const addSpellItem = {
  command: "addNewSpell",
  alwaysShow: true,
};


// |--------------------------------|
// |        Select The Spell        |
// |--------------------------------|

async function selectSpell({ spells, mapPage, mapDelay, showMap }) {
  //console.log('---- selectSpell() ----')


  const configs = Settings.useConfigs();

  if (selectSpellQuickPick) {
    selectSpellQuickPick.dispose();
  }

  selectSpellQuickPick = vscode.window.createQuickPick();

  //   Props
  // ---------
  selectSpellQuickPick.placeholder = "Choose a Spell ...";
  selectSpellQuickPick.onDidTriggerButton((event) => event.trigger());
  selectSpellQuickPick.onDidTriggerItemButton((event) => event.button.trigger());
  selectSpellQuickPick.visible = false;

  //   TitleBar
  // ------------
  const displayTitle = configs.get(Settings.keys.displayMapTitle);
  if (displayTitle) {
    selectSpellQuickPick.title = `${Settings.titleIcon} ${mapPage}`;

    if (mapPage) {
      const mapPageKeybinding = Keybindings.getKeybindingForPage(mapPage);
      selectSpellQuickPick.buttons = [
        {
          ...Settings.buttons.editPage,
          trigger: () => {
            Keybindings.revealKeybinding(mapPageKeybinding);
          },
        },
      ];
    }
  }

  // |-----------------------|
  // |        Feature        |
  // |-----------------------|
  // go back page button for nested pages?
  // selectSpellQuickPick.buttons= [];

  //   add Menuitems to QuickPick
  // ------------------------------

  // must set descripiton at call time to get current icon setting
  addSpellItem.description = `$(add) ${configs.get(Settings.keys.spellIcon)}`;

  selectSpellQuickPick.items = [...spells, addSpellItem];


  selectSpellQuickPick.showMap = () => {
    //console.log('selectSpellQuickPick.showMap()');
    selectSpellQuickPick.show();
    selectSpellQuickPick.visible = true;
    When.setMapIsVisibleContext();
  }

  //   Map Delay
  // -------------
  if (mapDelay === undefined){ // get default value
    mapDelay = configs.get(Settings.keys.defaultMapDelay);
  }
  if (showMap === undefined){ // get default value
    showMap =  configs.get(Settings.keys.defaultShowMap);
  }

  if (showMap){
    if (mapDelay) {
      // show map after delay
      mapOpenTimer = setTimeout(() => {
        if (selectSpellQuickPick && !selectSpellQuickPick.visible) {
          selectSpellQuickPick.showMap()
        }
      }, mapDelay);
    } else {
      // show map immediately
      selectSpellQuickPick.showMap();
    }
  }

  return new Promise((resolve) => {

    selectSpellQuickPick.discard = () => {
      //console.log('selectSpellQuickPick.discard()');

      // a new event handler is necessary
      // .onDidHide() is not triggered if the QuickPick is disposed BEFORE the map is shown
      // this means the promise would not be resolved if closeMap is called before the Map is displayed
      // using a custom event handler ensures proper disposal
      resolve(undefined);
      When.removeMapIsVisibleContext();
      selectSpellQuickPick.dispose();
      cancelTimer();
    }

    selectSpellQuickPick.onDidHide(() => {
      //console.log('selectSpellQuickPick.onDidHide()');
      selectSpellQuickPick.discard();
    });

    selectSpellQuickPick.onDidAccept(() => {
      //console.log('selectSpellQuickPick.onDidAccept()');
      const [selection] = selectSpellQuickPick.activeItems;
      resolve(selection);
      selectSpellQuickPick.discard();
    });
  });
}

const addPageItem = {
  command: "addNewPage",
  alwaysShow: true,
};


// |-------------------------------|
// |        Select The Page        |
// |-------------------------------|

async function selectPage({ pages, mapPage }) {

  const configs = Settings.useConfigs();

  if (selectPageQuickPick) {
    selectPageQuickPick.dispose();
  }

  selectPageQuickPick = vscode.window.createQuickPick();

  //   Props
  // ---------
  selectPageQuickPick.placeholder = "Choose a Page ...";
  selectPageQuickPick.onDidTriggerItemButton((event) => event.button.trigger());

  //   TitleBar
  // ------------
  const displayTitle = configs.get(Settings.keys.displayMapTitle);
  if (displayTitle) {
    if (mapPage) {
      selectPageQuickPick.title = `${Settings.titleIcon} ${mapPage}`;
    } else {
      selectPageQuickPick.title = Settings.inputBoxTitle;
    }
  }

  //   add Menuitems to QuickPick
  // ------------------------------

  // must set descripiton at call time to get current icon setting
  addPageItem.description = `$(add) ${configs.get(Settings.keys.pageIcon)}`;

  selectPageQuickPick.items = [...pages, addPageItem];

  selectPageQuickPick.show();

  return new Promise((resolve) => {
    selectPageQuickPick.onDidHide(() => {
      resolve(undefined);
      selectPageQuickPick.dispose();
    });
    selectPageQuickPick.onDidAccept(() => {
      const [selection] = selectPageQuickPick.activeItems;
      resolve(selection);
      selectPageQuickPick.dispose();
    });
  });
}


// |------------------------------------------|
// |        Select The Order of Spells        |
// |------------------------------------------|

async function selectOrder({ spells, spellToMove, mapPage }) {
  if (selectOrderQuickPick) {
    selectOrderQuickPick.dispose();
  }

  const configs = Settings.useConfigs();

  spellToMove.alwaysShow = true;

  const isSeparator = spellToMove.kind === vscode.QuickPickItemKind.Separator;

  selectOrderQuickPick = vscode.window.createQuickPick();

  selectOrderQuickPick.placeholder =
    "Choose where the Spell should go. (Click) or (UP/DOWN)";
  selectOrderQuickPick.keepScrollPosition = true;

  //   TitleBar
  // ------------
  const displayTitle = configs.get(Settings.keys.displayMapTitle);
  if (displayTitle) {
    if (mapPage) {
      selectOrderQuickPick.title = `${Settings.titleIcon} ${mapPage}`;
    } else {
      selectOrderQuickPick.title = Settings.inputBoxTitle;
    }
  }

  const spellToMoveIndex = spells.findIndex(
    (spell) =>
      spell.label === spellToMove.label &&
      spell.description === spellToMove.description
  );

  const movingExistingSpell = spellToMoveIndex !== -1;

  if (movingExistingSpell) {
    spells.splice(spellToMoveIndex, 1);
  }

  // modify labels for visual feedback
  if (!isSeparator) {
    spellToMove.label = `   $(primitive-dot) ${spellToMove.label}`;
  }
  spells = spells.map((spell) => {
    if (
      // spell is separator
      spell.kind &&
      spell.kind === vscode.QuickPickItemKind.Separator
    ) {
      return spell;
    } else {
      return {
        ...spell,
        alwaysShow: true,
        buttons: undefined, // remove buttons
        label: `            $(primitive-dot) ${spell.label}`,
      };
    }
  });

  function insertNewSpellAt(index) {
    return spells.toSpliced(index, 0, spellToMove);
  }

  const endOfList = spells.length;

  let startingOrder;

  if (isSeparator) {
    startingOrder = insertNewSpellAt(0);
    selectOrderQuickPick.items = startingOrder;
  } else {
    startingOrder = insertNewSpellAt(
      movingExistingSpell ? spellToMoveIndex : endOfList
    );
    selectOrderQuickPick.items = startingOrder;
    selectOrderQuickPick.activeItems = [spellToMove];
  }

  // prevent user typing from messing with stuff
  selectOrderQuickPick.onDidChangeValue(() => {
    selectOrderQuickPick.value = "";
    selectOrderQuickPick.items = startingOrder;
    selectOrderQuickPick.activeItems = [spellToMove];
  });

  function findItem(item, searchItem) {
    for (const key in searchItem) {
      if (item[key] !== searchItem[key]) {
        return false;
      }
    }
    return true;
  }

  let updatingMenuItems = false;
  let prevActiveIndex = 0;

  selectOrderQuickPick.onDidChangeActive(() => {
    if (updatingMenuItems) {
      // prevent loop
      return;
    }
    updatingMenuItems = true;

    const [activeItem] = selectOrderQuickPick.activeItems;

    const activeIndex = selectOrderQuickPick.items.findIndex((item) =>
      findItem(item, activeItem)
    );

    if (isSeparator) {
      const movingDown = activeIndex > prevActiveIndex;
      const insertAt =
        activeIndex === 0 ? 0 : movingDown ? activeIndex - 1 : activeIndex + 1;

      selectOrderQuickPick.items = insertNewSpellAt(insertAt);
      selectOrderQuickPick.activeItems = [
        selectOrderQuickPick.items[activeIndex === 0 ? 1 : activeIndex],
      ];

      prevActiveIndex = activeIndex;
    } else {
      selectOrderQuickPick.items = insertNewSpellAt(activeIndex);
      selectOrderQuickPick.activeItems = [spellToMove];
    }

    setTimeout(() => {
      updatingMenuItems = false;
    }, 100);
  });

  selectOrderQuickPick.show();

  return new Promise((resolve) => {
    selectOrderQuickPick.onDidAccept(() => {
      const spells = selectOrderQuickPick.items;
      resolve(spells);
      selectOrderQuickPick.dispose();
    });
    selectOrderQuickPick.onDidHide(() => {
      resolve(undefined);
      selectOrderQuickPick.dispose();
    });
  });
}

function updateSpellsOnPage(spells) {

  StatusBars.saving.initialize().show();

  spells = spells.map((spell) => ({
    key: spell.key,
    command: spell.command,
    when: spell.when,
    args: {
      ...spell.args,
    },
  }));
  Keybindings.saveKeybindings(spells);
  return spells;
}

function createSeparator(label) {
  return {
    label,
    kind: vscode.QuickPickItemKind.Separator,
  };
}

function generateEditSpellButton(spell) {
  return {
    ...Settings.buttons.editSpell,
    trigger: () => {
      Keybindings.revealKeybinding(spell);
    },
  };
}

function generateRemoveSpellButton(spell) {
  return {
    ...Settings.buttons.removeSpell,
    trigger: () => {
      vscode.window
        .showWarningMessage(
          "Are you sure you want to delete this Spell?",
          "Yes",
          "No"
        )
        .then((selected) => {
          if (selected === "Yes") {
            Keybindings.removeKeybinding(spell);
          }
        });
    },
  };
}

function createPageMenuItems(
  keybindings,
  { mapPage, includeButtons = true } = {}
) {
  const configs = Settings.useConfigs();

  const generateDescription = includeButtons
    ? (key) => Settings.prettifyKey(key)
    : () => {};

  function convertKeybinding(keybinding) {
    const args = keybinding.args;
    return {
      // menuItem
      ...keybinding,
      label:
        keybinding.command === Settings.keys.commands.openMapPage
          ? `${configs.get(Settings.keys.pageIcon)} ${args.mapPage}`
          : `   ${configs.get(Settings.keys.subpageIcon)} ${args.args.mapPage}`,
      description: generateDescription(keybinding.key),
    };
  }

  let pages = keybindings.map(convertKeybinding);

  const justMainPages = pages.filter(
    (spell) => spell.args && spell.args.mapPage
  );

  if (includeButtons) {
    // Add Buttons
    pages = pages.map((spell) => {
      const moveSpellButton = {
        ...Settings.buttons.moveSpell,
        trigger: async () => {
          // |--------------------------|
          // |        Move Spell        |
          // |--------------------------|

          // selectPageQuickPick._reordering = true;

          let orderedSpells = await selectOrder({
            // do not include the nestedPages while ordering
            spells: justMainPages,
            spellToMove: spell,
            mapPage,
          });
          if (orderedSpells === undefined) {
            disposeQuickPicks();
            StatusBars.dispose();
            return; // exit
          }

          updateSpellsOnPage(orderedSpells);
        },
      };

      const buttons = [];
      const spellIsNestedPage =
        spell.args && spell.args.command === Settings.keys.commands.openMapPage;

      if (!spellIsNestedPage) {
        buttons.push(moveSpellButton);
      }
      buttons.push(generateEditSpellButton(spell));
      buttons.push(generateRemoveSpellButton(spell));

      return {
        ...spell,
        buttons,
      };
    });
  }
  return sortPages(pages);
}

/*
    this function is to sort the pages with their respective nested pages underneath them
  */
function sortPages(keybindings) {
  const pages = [];
  const nestedPagesMap = {};

  // First pass: Separate pages and store nestedPages in a dictionary
  keybindings.forEach((binding) => {
    const mapPage = binding.args.mapPage;

    if (mapPage) {
      // its a page
      pages.push(binding);
    } else {
      // nestedPage
      const when = binding.when.split("||")[0].trim();
      if (!nestedPagesMap[when]) {
        nestedPagesMap[when] = [];
      }
      nestedPagesMap[when].push(binding);
    }
  });

  // Create the sorted list
  const sortedKeybindings = [];

  pages.forEach((page) => {
    sortedKeybindings.push(page);

    // Append the nestedPages for this page, if any exist
    const when = When.serializer(page.args.mapPage);
    if (nestedPagesMap[when]) {
      sortedKeybindings.push(...nestedPagesMap[when]);
    }
  });

  return sortedKeybindings;
}

function createSpellMenuItems(keybindings, { mapPage }) {
  const configs = Settings.useConfigs();

  function convertKeybinding(keybinding) {
    const args = keybinding.args;
    let label;
    let description;

    if (keybinding.command === "separator") {
      return {
        ...createSeparator(keybinding.args.label),
        ...keybinding,
      };
    } else if (args.command === Settings.keys.commands.openMapPage) {
      //   Keybinding is a nested Page
      // -------------------------------
      label = `   ${configs.get(Settings.keys.subpageIcon)} Go to ${
        args.args.mapPage
      } ...`;
      description = Settings.prettifyKey(keybinding.key);
    } else {
      //   keybinding is a spell
      // -------------------------
      label = `${configs.get(Settings.keys.spellIcon)} ${
        args.label ? args.label : args.command
      }`;
      description = `${Settings.prettifyKey(keybinding.key)}${
        // if displayCommandId and there is a label
        configs.get(Settings.keys.displayCommandId) && args.label
          ? // show the command id
            `  ${args.command}`
          : ""
      }`;
    }

    return {
      // menuItem
      ...keybinding,
      label,
      description,
    };
  }

  let spells = keybindings.map(convertKeybinding);

  spells = spells.map((spell) => {
    //   Add Buttons
    // ---------------

    const buttons = [];

    if(spells.length > 0){
      buttons.push({
        ...Settings.buttons.moveSpell,
        trigger: async () => {

          // |--------------------------|
          // |        Move Spell        |
          // |--------------------------|

          let orderedSpells = await selectOrder({
            spells,
            spellToMove: spell,
            mapPage,
          });
          if (orderedSpells === undefined) {
            return; // exit
          }
          updateSpellsOnPage(orderedSpells);
        },
      });
    }
    buttons.push(generateEditSpellButton(spell));
    buttons.push(generateRemoveSpellButton(spell));

    return {
      ...spell,
      buttons,
    };
  });

  return spells;
}

function disposeQuickPicks() {
  if (selectSpellQuickPick) {
    selectSpellQuickPick.dispose();
  }
  if (selectPageQuickPick) {
    selectPageQuickPick.dispose();
  }
}

function cancelTimer() {
  if (mapOpenTimer){
    clearTimeout(mapOpenTimer);
    mapOpenTimer = null;
  }
}

function initialize(context){
  context.subscriptions.push(
    selectSpellQuickPick,
    selectPageQuickPick,
    selectOrderQuickPick
  )
}

module.exports = {
  initialize,
  selectPage,
  get selectPageQuickPick() {
    return selectPageQuickPick;
  },
  selectSpell,
  get selectSpellQuickPick() {
    return selectSpellQuickPick;
  },
  selectOrder,
  addSpellItem,
  addPageItem,
  createPageMenuItems,
  createSpellMenuItems,
  createSeparator,
  updateSpellsOnPage,
  cancelTimer,
};
