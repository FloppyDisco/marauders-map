// managers
const Settings = require("./managers/settingsManager");
const Keybindings = require("./managers/keybindingsManager");
const Prompts = require("./managers/promptManager");
const Picks = require("./managers/quickPickManager");
const When = require("./managers/whenManager");

/**
 * this function prompts the user through the process of creating a new keybinding for the Marauders Map
 *
 * @param {string} mapPage what page Does this Spell go on
 * @returns the keybinding for the new Spell
 */
module.exports = async (mapPage) => {
  let selectedArgs;
  let nestedPage;
  let selectedLabel;
  let selectedKey;
  let needLabel;
  let needKey;
  let needPage;
  let isSeparator;
  let when = When.serializer(mapPage);

  const selectedCommand = await Prompts.promptUserForCommand({ mapPage });

  switch (selectedCommand) {
    case undefined:
      return; // exit on 'Esc' key

    case Settings.keys.commands.openMapPage:
      //   User selected a nested Page
      // -------------------------------
      needPage = true;
      needKey = true;
      selectedLabel = undefined;
      when = `${when} || ${Settings.keys.selectingMapPage}`;
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
    const pages = Picks.createPageMenuItems(PagesKeybindings, {
      includeButtons: false,
    });

    // ask which Page this command will go to =>
    const selection = await Picks.selectPage({ pages, mapPage });
    if (selection === undefined) {
      return; // exit on 'Esc' key

    } else if (selection.command === Picks.addPageItem.command) {
      // prompt user for newPage name
      nestedPage = await Prompts.promptUserForNewPageName({ mapPage });

    } else {
      nestedPage = selection.args.mapPage;
    }

    selectedArgs = {
      mapPage: nestedPage,
    };
  }

  if (needKey) {
    selectedKey = await Prompts.promptUserForKey(mapPage);
    if (selectedKey === undefined) {
      return; // exit on 'Esc' key
    }
  }

  if (needLabel) {
    selectedLabel = await Prompts.promptUserForLabel({
      selectedCommand,
      mapPage,
    });
    if (selectedLabel === undefined) {
      return; // exit on 'Esc' key
    }
  }

  //   New keybinding
  // ------------------

  return isSeparator
    ? {
        command: selectedCommand,
        when,
        args: {
          label: selectedLabel,
        },
      }
    : {
        key: selectedKey ? selectedKey : undefined, // set to undefined for serialization
        command: Settings.keys.commands.closeMap,
        when,
        args: {
          command: selectedCommand,
          label: selectedLabel,
          args: selectedArgs,
        },
      };
};
