// managers
const settings = require("./managers/settingsManager");
const keybindingsMgr = require("../src/managers/keybindingsManager");

const keybindings = [
  {
    key: "e",
    command: "maraudersMap.iSolemnlySwearThatIAmUpToNoGood",
    when: "!maraudersMapIsOpen",
    args: {
      mapPage: "Editor Spells",
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
      label: "Move Editor To Next Group",
    },
  },
  {
    key: "h",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.moveEditorToPreviousGroup",
      label: "Move Editor to Previous Group",
    },
  },
  {
    key: ",",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.splitEditorDown",
      label: "Split Editor Down",
      order: 1,
    },
  },
  {
    key: "l",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "workbench.action.toggleEditorGroupLayout",
      label: "Toggle Layout",
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
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "separator",
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
    key: "f",
    command: "maraudersMap.mischiefManaged",
    when: "maraudersMap.Editor_Spells",
    args: {
      command: "maraudersMap.iSolemnlySwearThatIAmUpToNoGood",
      args: {
        mapPage: "Fold Commands",
      },
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
];
const PCkeybindings = keybindings.map((kb) => ({
  ...kb,
  key: kb.key ? `ctrl+${kb.key}` : undefined,
}));
const MacKeybindings = keybindings.map((kb) => ({
  ...kb,
  key: kb.key ? `cmd+${kb.key}` : undefined,
}));

/**
 * A function to install the example Page and Spell keybindings
 */
function installExamplePages() {
  const keybindings =
    settings.platform === "darwin" ? MacKeybindings : PCkeybindings;
  keybindings.forEach((kb) => {
    keybindingsMgr.saveKeybinding(kb);
  });
}

const examplePagesKey = `${settings.keys.maraudersMapPrefix}.${settings.keys.examplePagesKey}`;

/**
 * A function to initialize the examplePages module.
 * @param {vscode.extensionContext} context
 *
 * Install example Pages and Spell keybindings for User on first install
 */
function initialize(context) {
  const examplePagesInstalled = context.globalState.get(examplePagesKey);

  // install pages if not previously installed
  if (!examplePagesInstalled) {
    installExamplePages();
    context.globalState.update(examplePagesKey, true);
  }
  // context.globalState.update(examplePagesKey, undefined);



  // |-----------------------|
  // |        Feature        |
  // |-----------------------|
  // register command to install example pages manually?

}

module.exports = {
  initialize,
};
