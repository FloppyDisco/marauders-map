const vscode = require("vscode");

const { useConfigs, configKeys } = require("../managers/settingsManager");
const { useWhenContext } = require("../managers/whenManager");

const kbManager = require("../managers/keybindingsManager");
const pageStatusBar = require("../components/pageStatusBar");

let maraudersMap;
let visible;

/**
 * Function to create and return the maraudersMap
 * @param   {string} mapPage The title for this Page of the Map
 * @returns {vscode.QuickPick} The maraudersMap quick pick
 */
function create() {
    visible = null;
    const configs = useConfigs();
    const { removeWhenContext } = useWhenContext();

    if (maraudersMap) {
        maraudersMap.dispose();
    }

    maraudersMap = vscode.window.createQuickPick();
    visible = false;

    if (configs.get(configKeys.displayMapTitle)) {
        maraudersMap.title = configs.get("inputBoxTitle");
    }

    maraudersMap.onDidHide(() => {
        // these MUST be called directly in function
        removeWhenContext(); // cancel the when context for this page of the map
        maraudersMap.dispose();
        visible = null;
        pageStatusBar.removeIfExists();
    });

    maraudersMap.onDidChangeSelection(([selection]) => {
        // these MUST be called directly in function
        removeWhenContext();
        maraudersMap.dispose();
        visible = null;
        pageStatusBar.removeIfExists();

        vscode.commands.executeCommand(selection.command, selection.args);
    });

    maraudersMap.onDidTriggerItemButton((event) => {
        const item = event.item;
        const selectedButton = event.button;
        const keybinding = item.keybinding;

        switch (selectedButton.id) {
            case configs.buttons.edit.id:
                kbManager.revealKeybinding(keybinding);
                break;
            // potentially add more buttons in future
        }
    });

    // |-----------------------|
    // |        Feature        |
    // |-----------------------|

    // add buttons to the box
    // maraudersMap.buttons= [];
    /*
        go back page button for nested pages?
    */
}

/**
 * Function to dispose of the mischiefStatusBar if it exists
 */
function removeIfExists() {
    if (maraudersMap) {
        // exists remove the old one
        maraudersMap.dispose();
    }
}

function updateTitle(mapPage) {
    const configs = useConfigs();
    if (maraudersMap && configs.get(configKeys.displayMapTitle)) {
        maraudersMap.title = `${configs.get(configKeys.titleIcon)} ${mapPage}`;
    }
}

function showComponent() {
    maraudersMap.show();
    visible = true;
}

function addItems(items) {
    // sort the items befor setting them to the map.
    maraudersMap.items = items.sort((a, b) => {
        // First criteria: check if either object has the command "MaraudersMap.iSolemnlySwearThatIAmUpToNoGood"
        const commandToCheck = configKeys.commands.openCommand;

        if (a.command === commandToCheck && b.command !== commandToCheck) {
            return -1; // `a` comes before `b`
        }
        if (a.command !== commandToCheck && b.command === commandToCheck) {
            return 1; // `b` comes before `a`
        }

        // Second criteria: Check if either object is missing the 'order' property
        const hasOrderA = "order" in a;
        const hasOrderB = "order" in b;

        if (hasOrderA && !hasOrderB) {
            return -1; // `a` with an 'order' property comes before `b` without it
        }
        if (!hasOrderA && hasOrderB) {
            return 1; // `b` with an 'order' property comes before `a` without it
        }

        // Third criteria: Sort by the 'order' property numerically if both have it
        if (hasOrderA && hasOrderB) {
            return a.order - b.order;
        }

        return 0;
    });
}

/**
 * Function for converting keybinding objects to Quick Pick items
 * @param {[object]} keybindings The Array of keybindings
 * @returns {[object]} The Array of objects representing Quick Pick items
 */
function convertKeybindingsToQuickPickItems(keybindings) {
    const configs = useConfigs();
    return keybindings.map(convertKeybinding);

    function convertKeybinding(keybinding) {
        const args = keybinding.args;
        let label;
        let description;

        if (keybinding.command === configKeys.commands.closeMap) {
            //   Keybinding is a Spell on a Page
            // -----------------------------------

            if (args.command === configKeys.command.openMap) {
                //   Keybinding is a nested Page
                // -------------------------------

                label = `   ${configs.get(configKeys.subpagesIcon)} Go to ${
                    args.args.mapPage
                } ...`;
                description = `${prettifyKey(keybinding.key)}`;

            } else {
                //   keybinding is a spell
                // -------------------------

                label = `${configs.get(configKeys.spellIcon)} ${
                    args.label ? args.label : args.command
                }`;
                description = `${prettifyKey(keybinding.key)}  ${
                    // if displayCommandId and there is a label
                    configs.get(configKeys.displayCommandId) && args.label
                        ? // show the command id
                          args.command
                        : ""
                }`;
            }
            
        } else if (keybinding.command === configKeys.commands.openMap) {
            //   keybinding is a page
            // ------------------------

            label = `${configs.get(configKeys.pagesIcon)} ${args.mapPage}`;
            description = prettifyKey(keybinding.key);

        }

        const buttons = [configs.get("buttons.edit")];

        return {
            ...keybinding.args,
            label,
            description,
            buttons,
            keybinding,
        };
    }
}

/**
 * Function to take a json keybinding code and return a human friendly display version
 * @param {string} keyCode the json keybinding.key
 * @returns {string} the prettified keyCode
 */
function prettifyKey(keyCode) {
    //  "cmd+alt+e" => "⌘⌥E"
    return `(${keyCode})`
        .toUpperCase()
        .replaceAll("+", "")
        .replace("CMD", "⌘")
        .replace("ALT", "⌥")
        .replace("CTRL", "^")
        .replace("SHIFT", "⇧");
}

module.exports = {
    create,
    showComponent,
    updateTitle,
    visible,
    removeIfExists,
    addItems,
    convertKeybindingsToQuickPickItems,
    component: maraudersMap,
};
