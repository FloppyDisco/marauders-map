// managers
const settings = require('./managers/settingsManager');
const KBmanager = require('../src/managers/keybindingsManager');

const keybindings = [
    {
        key: "ctrl+e",
        command: "maraudersMap.iSolemnlySwearThatIAmUpToNoGood",
        when: "!maraudersMapIsOpen",
        args: {
            mapPage: "Editor Spells",
        },
        mac: "cmd+e",
        linux: "ctrl+e",
    },
    {
        key: "ctrl+e",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.focusNextGroup",
            label: "Focus Next Editor Group",
        },
        mac: "cmd+e",
        linux: "ctrl+e",
    },
    {
        key: "ctrl+n",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.moveEditorToNextGroup",
            label: "Move Editor To Next Group",
        },
        mac: "cmd+n",
        linux: "ctrl+n",
    },
    {
        key: "ctrl+h",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.moveEditorToPreviousGroup",
            label: "Move Editor to Previous Group",
        },
        mac: "cmd+h",
        linux: "ctrl+h",
    },
    {
        key: "ctrl+,",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.splitEditorDown",
            label: "Split Down",
        },
        mac: "cmd+,",
        linux: "ctrl+,",
    },
    {
        key: "ctrl+l",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.toggleEditorGroupLayout",
            label: "Toggle Layout",
        },
        mac: "cmd+l",
        linux: "ctrl+l",
    },
    {
        key: "ctrl+m",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.toggleMaximizeEditorGroup",
            label: "Maximize Editor Group",
        },
        mac: "cmd+m",
        linux: "ctrl+m",
    },
    {
        key: "ctrl+w",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.closeEditorsAndGroup",
            label: "Close Group",
        },
        mac: "cmd+w",
        linux: "ctrl+w",
    },
    {
        key: "ctrl+o",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.closeOtherEditors",
            label: "Close Other Editors In Group",
        },
        mac: "cmd+o",
        linux: "ctrl+o",
    },
    {
        key: "ctrl+f",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Editor_Spells",
        args: {
            command: "maraudersMap.iSolemnlySwearThatIAmUpToNoGood",
            args: {
                mapPage: "Fold Spells",
                mac: "cmd+f",
                linux: "ctrl+f",
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
        mac: "cmd+f",
        linux: "ctrl+f",
    },
    {
        key: "ctrl+a",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.foldAll",
            label: "Fold All",
        },
        mac: "cmd+a",
        linux: "ctrl+a",
    },
    {
        key: "ctrl+e",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.foldAllExcept",
            label: "Fold All Except",
        },
        mac: "cmd+e",
        linux: "ctrl+e",
    },
    {
        key: "ctrl+u",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldRecursively",
            label: "Unfold",
        },
        mac: "cmd+u",
        linux: "ctrl+u",
    },
    {
        key: "ctrl+n",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldAll",
            label: "Unfold All",
        },
        mac: "cmd+n",
        linux: "ctrl+n",
    },
    {
        key: "ctrl+x",
        command: "maraudersMap.mischiefManaged",
        when: "maraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldAllExcept",
            label: "Unfold All Except",
        },
        mac: "cmd+x",
        linux: "ctrl+x",
    },
];

/**
 * A function to install the example Page and Spell keybindings
 */
function installExamplePages(){
    keybindings.forEach((kb) => {
        KBmanager.saveKeybinding(kb);
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
