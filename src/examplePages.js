exports.keybindings = [
    {
        key: "ctrl+e",
        command: "MaraudersMap.iSolemnlySwearThatIAmUpToNoGood",
        when: "!MaraudersMapIsOpen",
        args: {
            mapPage: "Editor Spells",
        },
        mac: "cmd+e",
        linux: "ctrl+e",
    },
    {
        key: "ctrl+e",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.focusNextGroup",
            label: "Focus Next Editor Group",
        },
        mac: "cmd+e",
        linux: "ctrl+e",
    },
    {
        key: "ctrl+n",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.moveEditorToNextGroup",
            label: "Move Editor To Next Group",
        },
        mac: "cmd+n",
        linux: "ctrl+n",
    },
    {
        key: "ctrl+h",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.moveEditorToPreviousGroup",
            label: "Move Editor to Previous Group",
        },
        mac: "cmd+h",
        linux: "ctrl+h",
    },
    {
        key: "ctrl+,",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.splitEditorDown",
            label: "Split Down",
        },
        mac: "cmd+,",
        linux: "ctrl+,",
    },
    {
        key: "ctrl+l",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.toggleEditorGroupLayout",
            label: "Toggle Layout",
        },
        mac: "cmd+l",
        linux: "ctrl+l",
    },
    {
        key: "ctrl+m",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.toggleMaximizeEditorGroup",
            label: "Maximize Editor Group",
        },
        mac: "cmd+m",
        linux: "ctrl+m",
    },
    {
        key: "ctrl+w",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.closeEditorsAndGroup",
            label: "Close Group",
        },
        mac: "cmd+w",
        linux: "ctrl+w",
    },
    {
        key: "ctrl+o",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Editor_Spells",
        args: {
            command: "workbench.action.closeOtherEditors",
            label: "Close Other Editors In Group",
        },
        mac: "cmd+o",
        linux: "ctrl+o",
    },
    {
        key: "ctrl+f",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Editor_Spells",
        args: {
            command: "MaraudersMap.iSolemnlySwearThatIAmUpToNoGood",
            args: {
                mapPage: "Fold Spells",
                mac: "cmd+f",
                linux: "ctrl+f",
            },
        },
    },
    {
        key: "ctrl+f",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Fold_Commands",
        args: {
            command: "editor.foldRecursively",
            label: "Fold",
        },
        mac: "cmd+f",
        linux: "ctrl+f",
    },
    {
        key: "ctrl+a",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Fold_Commands",
        args: {
            command: "editor.foldAll",
            label: "Fold All",
        },
        mac: "cmd+a",
        linux: "ctrl+a",
    },
    {
        key: "ctrl+e",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Fold_Commands",
        args: {
            command: "editor.foldAllExcept",
            label: "Fold All Except",
        },
        mac: "cmd+e",
        linux: "ctrl+e",
    },
    {
        key: "ctrl+u",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldRecursively",
            label: "Unfold",
        },
        mac: "cmd+u",
        linux: "ctrl+u",
    },
    {
        key: "ctrl+n",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldAll",
            label: "Unfold All",
        },
        mac: "cmd+n",
        linux: "ctrl+n",
    },
    {
        key: "ctrl+x",
        command: "MaraudersMap.mischiefManaged",
        when: "MaraudersMap.Fold_Commands",
        args: {
            command: "editor.unfoldAllExcept",
            label: "Unfold All Except",
        },
        mac: "cmd+x",
        linux: "ctrl+x",
    },
];
