const vscode = require("vscode");

// managers
const Settings = require("./managers/settingsManager");
const Keybindings = require("../src/managers/keybindingsManager");
const Notifications = require("../src/managers/notificationsManager");

const examplePageKeybinding = {
  key: "e",
  command: "maraudersMap.iSolemnlySwearThatIAmUpToNoGood",
  when: "!maraudersMapIsActive",
  args: {
    mapPage: "Editor Spells",
  },
}
const baseKeybindings = [
  {
    key: "e",
    command: "-actions.findWithSelection",
  },
  examplePageKeybinding,
  {
    command: "separator",
    when: "maraudersMap.Fold_Commands",
    args: {
      label: "Fold",
    },
  },
  {
    key: "f",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Fold_Commands",
    args: {
      command: "editor.foldRecursively",
      label: "Fold",
    },
  },
  {
    key: "a",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Fold_Commands",
    args: {
      command: "editor.foldAll",
      label: "Fold All",
    },
  },
  {
    key: "e",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Fold_Commands",
    args: {
      command: "editor.foldAllExcept",
      label: "Fold All Except",
    },
  },
  {
    command: "separator",
    when: "maraudersMap.Fold_Commands",
    args: {
      label: "Unfold",
    },
  },
  {
    key: "u",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Fold_Commands",
    args: {
      command: "editor.unfoldRecursively",
      label: "Unfold",
    },
  },
  {
    key: "n",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Fold_Commands",
    args: {
      command: "editor.unfoldAll",
      label: "Unfold All",
    },
  },
  {
    key: "x",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Fold_Commands",
    args: {
      command: "editor.unfoldAllExcept",
      label: "Unfold All Except",
    },
  },
  {
    key: "f",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "maraudersMap.iSolemnlySwearThatIAmUpToNoGood",
      args: {
        mapPage: "Fold Commands",
        mapDelay: 0,
      },
    },
  },
  {
    key: "e",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.focusNextGroup",
      label: "Focus Next Editor Group",
    },
  },
  {
    key: "n",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.moveEditorToNextGroup",
      label: "Move Editor into Next Group",
    },
  },
  {
    key: "p",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.moveEditorToPreviousGroup",
      label: "Move Editor into Prev Group",
    },
  },
  {
    key: "m",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.toggleMaximizeEditorGroup",
      label: "Maximize Editor Group",
    },
  },
  {
    key: "l",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.toggleEditorGroupLayout",
      label: "Toggle Editor Layout",
    },
  },
  {
    command: "separator",
    when: "maraudersMap.Editor_Spells",
    args: {
      label: "Close Editors",
    },
  },
  {
    key: "w",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.closeEditorsAndGroup",
      label: "Close Group",
    },
  },
  {
    key: "o",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.closeOtherEditors",
      label: "Close Other Editors In Group",
    },
  },
  {
    key: "shift+o",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.closeEditorsInOtherGroups",
      label: "Close Other Groups",
    },
  },
];

function addPlatformModifier(keybindings) {
  const isMac = Settings.platform === "darwin";
  return keybindings.map((kb) => ({
    ...kb,
    key: kb.key ? `${isMac ? "cmd" : "ctrl"}+${kb.key}` : undefined,
  }));
}

/**
 * A function to install the example Pages and Spells keybindings
 */
function installExamplePages() {
  Keybindings.saveKeybindings(addPlatformModifier(baseKeybindings));
}

/**
 * A function to initialize the examplePages module.
 * @param {vscode.extensionContext} context
 *
 * Install example Pages and Spell keybindings for User on first install
 */
async function initialize(context) {
  const examplesAlreadyInstalled = context.globalState.get(
    Settings.keys.examples
  );

  if (!examplesAlreadyInstalled) {
    const button = "Install"
    await Notifications.confirm({
        message: "Install Keyboard Shortcuts?",
        detail: "The Marauder's Map is all about making your own keyboard shortcuts, but it comes with a few to help you get started. Would you like to install them?",
        button,
    }).then(selected => {
      if (selected === button) {
        installExamplePages();
        Notifications.newPage(addPlatformModifier([examplePageKeybinding]).pop())
      }
    });
    context.globalState.update(Settings.keys.examples, true);
  }

  // debugging: set the install flag back to false
  context.globalState.update(Settings.keys.examples, undefined);
}

module.exports = {
  initialize,
};
