// managers
const settings = require('./managers/settingsManager');
const keybindingsMgr = require('../src/managers/keybindingsManager');

const PCkeybindings = [
    {
        key: "ctrl+e",
        command: "maraudersMap.iSolemnlySwearThatIAmUpToNoGood",
        when: "!maraudersMapIsOpen",
        args: {
            mapPage: "Editor Spells",
        },
    },
    {
        key: "ctrl+e",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.focusNextGroup",
            label: "Focus Next Editor Group",
        },
    },
    {
        key: "ctrl+n",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.moveEditorToNextGroup",
            label: "Move Editor To Next Group",
        },
    },
    {
        key: "ctrl+h",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.moveEditorToPreviousGroup",
            label: "Move Editor to Previous Group",
        },
    },
    {
        key: "ctrl+,",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.splitEditorDown",
            label: "Split Down",
        },
    },
    {
        key: "ctrl+l",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.toggleEditorGroupLayout",
            label: "Toggle Layout",
        },
    },
    {
        key: "ctrl+m",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.toggleMaximizeEditorGroup",
            label: "Maximize Editor Group",
        },
    },
    {
        key: "ctrl+w",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.closeEditorsAndGroup",
            label: "Close Group",
        },
    },
    {
        key: "ctrl+o",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.closeOtherEditors",
            label: "Close Other Editors In Group",
        },
    },
    {
        key: "ctrl+f",
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
        key: "ctrl+f",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.foldRecursively",
            label: "Fold",
        },
    },
    {
        key: "ctrl+a",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.foldAll",
            label: "Fold All",
        },
    },
    {
        key: "ctrl+e",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.foldAllExcept",
            label: "Fold All Except",
        },
    },
    {
        key: "ctrl+u",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldRecursively",
            label: "Unfold",
        },
    },
    {
        key: "ctrl+n",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldAll",
            label: "Unfold All",
        },
    },
    {
        key: "ctrl+x",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldAllExcept",
            label: "Unfold All Except",
        },
    },
];
const MacKeybindings = [
    {
        key: "cmd+e",
        command: "maraudersMap.iSolemnlySwearThatIAmUpToNoGood",
        when: "!maraudersMapIsOpen",
        args: {
            mapPage: "Editor Spells",
        },
    },
    {
        key: "cmd+e",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.focusNextGroup",
            label: "Focus Next Editor Group",
        },
    },
    {
        key: "cmd+n",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.moveEditorToNextGroup",
            label: "Move Editor To Next Group",
        },
    },
    {
        key: "cmd+h",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.moveEditorToPreviousGroup",
            label: "Move Editor to Previous Group",
        },
    },
    {
        key: "cmd+,",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.splitEditorDown",
            label: "Split Down",
        },
    },
    {
        key: "cmd+l",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.toggleEditorGroupLayout",
            label: "Toggle Layout",
        },
    },
    {
        key: "cmd+m",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.toggleMaximizeEditorGroup",
            label: "Maximize Editor Group",
        },
    },
    {
        key: "cmd+w",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.closeEditorsAndGroup",
            label: "Close Group",
        },
    },
    {
        key: "cmd+o",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.closeOtherEditors",
            label: "Close Other Editors In Group",
        },
    },
    {
        key: "cmd+f",
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
        key: "cmd+f",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.foldRecursively",
            label: "Fold",
        },
    },
    {
        key: "cmd+a",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.foldAll",
            label: "Fold All",
        },
    },
    {
        key: "cmd+e",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.foldAllExcept",
            label: "Fold All Except",
        },
    },
    {
        key: "cmd+u",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldRecursively",
            label: "Unfold",
        },
    },
    {
        key: "cmd+n",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldAll",
            label: "Unfold All",
        },
    },
    {
        key: "cmd+x",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldAllExcept",
            label: "Unfold All Except",
        },
    },
];

/**
 * A function to install the example Page and Spell keybindings
 */
function installExamplePages(){
    const keybindings = keybindingsMgr.platform === "darwin" ? MacKeybindings : PCkeybindings
    keybindings.forEach((kb) => {
        keybindingsMgr.saveKeybinding(kb);
    })
}



const examplePagesKey = `${settings.keys.maraudersMapPrefix}.${settings.keys.examplePagesKey}`

/**
 * A function to initialize the examplePages module.
 * @param {vscode.extensionContext} context
 *
 * Install example Pages and Spell keybindings for User on first install
 */
function  initialize(context) {

    const examplePagesInstalled = context.globalState.get(examplePagesKey);

    // install pages if not previously installed
    if (!examplePagesInstalled){
        installExamplePages();
        context.globalState.update(examplePagesKey, true);
    }

    // |-----------------------|
    // |        Feature        |
    // |-----------------------|

    // register command to install example pages manually?

    // context.globalState.update(examplePagesKey, undefined);
}

module.exports ={
    initialize
}
