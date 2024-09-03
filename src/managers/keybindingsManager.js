const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const jsonc = require("jsonc-parser");
const { COMMANDS, SETTINGS } = require("../constants");

/**
 * Function to determine if the extension is running in VSCodium or VS Code.
 * @returns {boolean} true if running in VSCodium, false if running in VS Code.
 */
function isVSCodium() {
    return vscode.env.appName.includes("VSCodium");
}

function getPathToKeybindingsFile() {
    const platform = os.platform();
    const baseFolder = isVSCodium() ? "VSCodium" : "Code"; // change directory name based on application

    // console.log('---------------');
    // console.log('platform',platform);
    // console.log('isVSCodium',isVSCodium());
    // console.log('baseFolder',baseFolder);

    switch (platform) {
        case "darwin": // macOS
            return path.join(
                os.homedir(),
                "Library",
                "Application Support",
                baseFolder,
                "User",
                "keybindings.json"
            );
        case "win32": // Windows
            return path.join(
                process.env.APPDATA || "",
                baseFolder,
                "User",
                "keybindings.json"
            );
        case "linux": // Linux
            return path.join(
                os.homedir(),
                ".config",
                baseFolder,
                "User",
                "keybindings.json"
            );
        default:
            // |-----------------------|
            // |        feature        |
            // |-----------------------|
            // add setting for user to provide path to keybindings.json

            throw new Error(`Unsupported platform: ${platform}`);
    }
}

/**
 * Function to get all keybindings from keybindings.json
 * @returns {array} - a array of all keybindings.
 */
function getKeybindings() {
    try {
        const data = fs.readFileSync(getPathToKeybindingsFile(), "utf8");
        const keybindings = jsonc.parse(data);
        return keybindings;
    } catch (error) {
        console.error("Error reading keybindings.json:", error);
        return [];
    }
}



/**
 * Function to filter an array of keybindings by the provided mapPage
 * @param {array} keybindings an array of keybindings parsed from keybindings.json
 * @param {string} mapPage the value to filter the keybindings by
 * @returns {array} the filtered keybindings
 */
function getSpellsForPage(keybindings, whenContext) {
    return keybindings
        .filter((kb) => {
            const whenClause = kb.when;
            return whenClause && whenClause === whenContext;
        })
        .map(createSpellMenuItemFromKeyBinding)
        .sort((a, b) => {
            // First criteria: check if either object has the command "MaraudersMap.iSolemnlySwearThatIAmUpToNoGood"
            const commandToCheck =
                "MaraudersMap.iSolemnlySwearThatIAmUpToNoGood";

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

            return 0
        });
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

function createSpellMenuItemFromKeyBinding(kb) {
    const args = kb.args;

    // |-----------------------|
    // |        Feature        |
    // |-----------------------|

    // this function needs to change to create different labels and descriptions for nested pages and spells
    let label;
    let description;
    if (args.command === COMMANDS.openMap) {
        // style as a nested page
        label = `   ${SETTINGS.subpagesIcon} Go to ${args.args.mapPage} ...`;
        description = `${prettifyKey(kb.key)}`;
    } else {
        // style as a spell
        label = `$(wand) ${args.label ? args.label : args.command}`;
        description = `${prettifyKey(kb.key)} ${
            args.label ? args.command : ""
        }`;
    }
    const buttons = [BUTTONS.edit]

    return {
        ...kb.args,
        label,
        description,
        buttons,
        keybinding: kb
    };
}

/**
 * Function to gather all mapPages created by the user
 * @param {array} keybindings an array of keybindings parsed from keybindings.json
 * @returns {array} - A list of map pages.
 */
function getAllPagesFromMap(keybindings) {
    // Use a Set to store unique mapPage values
    const setOfAllMapPages = new Set();
    const mapPages = {};
    const nestedMapPages = {};

    keybindings.forEach((keybinding) => {
        if (
            keybinding.command === COMMANDS.openMap &&
            keybinding.args !== undefined
        ) {
            const mapPage = keybinding.args.mapPage;
            if (mapPage) {
                // openMap command with a mapPage
                setOfAllMapPages.add(mapPage);
                mapPages[mapPage] = createPageMenuItem(keybinding);
            }
        } else if (
            keybinding.command === COMMANDS.closeMap &&
            keybinding.args !== undefined &&
            keybinding.args.command === COMMANDS.openMap
        ) {
            const nestedArgs = keybinding.args.args;
            if (nestedArgs && nestedArgs.mapPage) {
                const mapPage = nestedArgs.mapPage;
                setOfAllMapPages.add(mapPage);
                nestedMapPages[mapPage] = createNestedPageMenuItem(keybinding);
            }
        }
    });

    const AllPages = Array.from(setOfAllMapPages).map((page) => {
        return mapPages.hasOwnProperty(page)
            ? mapPages[page]
            : nestedMapPages[page];
    });

    return AllPages;


}



/**
 * Function to take a keybinding object and return the display data for the quick Picker
 * @param {object} keybinding
 * @returns {object} The page object for the UI quickPicker
 */
function createPageMenuItem(keybinding) {
    const mapPage = keybinding.args.mapPage;
    const label = `${SETTINGS.pagesIcon} ${mapPage}`;
    const description = prettifyKey(keybinding.key);
    const buttons = [BUTTONS.edit]
    return {
        mapPage,
        label,
        description,
        buttons,
        keybinding,
    };
    /*
        {
            "mapPage": "thisPage",
            "key": "cmd+f",
            "nestedUnder": "otherPage",
            "label": "${SETTINGS.pagesIcon} ThisPage (cmd+f)", => generate with prettifyKey
        }
    */
}

/**
 * Function to take a keybinding object and return the display data for the quick Picker
 * @param {object} keybinding
 * @returns {object} The page object for the UI quickPicker
 */
function createNestedPageMenuItem(keybinding) {
    const page = keybinding.args.args.mapPage;
    const label = `  ${SETTINGS.subpagesIcon} ${page}`;
    const buttons = [BUTTONS.edit]
    return {
        label,
        mapPage: page,
        nestedUnder: keybinding.when.split(".")[1],
        buttons,
        keybinding,
    };
    /*
        {
            "mapPage": "thisPage",
            "nestedUnder": "otherPage", // if this is undefined it wont show.
            "label": "${SETTINGS.pagesIcon} ThisPage (cmd+f)", => generate with prettifyKey
        }
    */
}

/**
 * Function to write a new keybinding to the keybindings.json file with a backup and preserve comments.
 * @param {Object} newKeybinding - The new keybinding object to add.
 */
function saveKeybinding(newKeybinding) {
    const keybindingsPath = getPathToKeybindingsFile();
    const backupPath = keybindingsPath + ".backup";

    try {
        const currentContent = fs.readFileSync(keybindingsPath, "utf8");
        fs.writeFileSync(backupPath, currentContent);

        // Parse the JSONC content preserving comments
        const currentKeybindings = jsonc.parse(currentContent) || [];
        const edits = jsonc.modify(
            currentContent,
            [currentKeybindings.length],
            newKeybinding,
            { formattingOptions: { insertSpaces: true, tabSize: 2 } }
        );

        // Apply the edits to the original content to get the new content with the comment preserved
        const newContent = jsonc.applyEdits(currentContent, edits);

        // Write the updated content back to keybindings.json
        fs.writeFileSync(keybindingsPath, newContent, "utf8");
    } catch (error) {
        console.error("Error writing to keybindings.json:", error);
    }
}

// |-----------------------|
// |        Feature        |
// |-----------------------|

// update keybinding function?


    /**
     * Function to open the keybindings.json file and reveal a specific keybinding by command.
     * @param {string} command - The command associated with the keybinding to find.
     */
    async function revealKeybinding(keybinding) {
        console.log('looking for the spell!',);
        console.log('keybinding',keybinding);


        // Open the keybindings.json file
        await vscode.commands.executeCommand('workbench.action.openGlobalKeybindingsFile');

        // Get the active text editor (which should be keybindings.json)
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            // Read the entire content of the keybindings.json file
            const document = editor.document;
            const text = document.getText();

            try {
                // Parse the JSONC content into an array of objects and get the JSON node tree
                const rootNode = jsonc.parseTree(text);

                if (rootNode) {
                    // Iterate through child nodes to find a matching keybinding
                    for (const node of rootNode.children) {
                        const parsedKeybinding = jsonc.getNodeValue(node);
                        if (parsedKeybinding && parsedKeybinding.key === keybinding.key &&
                            parsedKeybinding.command === keybinding.command &&
                            JSON.stringify(parsedKeybinding.args) === JSON.stringify(keybinding.args)) {

                            // Get the start position of the node
                            const startPosition = document.positionAt(node.offset);

                            // Reveal and highlight the line in the editor
                            editor.revealRange(new vscode.Range(startPosition, startPosition ), vscode.TextEditorRevealType.AtTop);
                            editor.selection = new vscode.Selection(startPosition, startPosition);
                            return;
                        }
                    }

                    vscode.window.showInformationMessage(`Keybinding not found.`);
                } else {
                    vscode.window.showErrorMessage('Failed to parse the keybindings.json file.');
                }
            } catch (error) {
                vscode.window.showErrorMessage('Failed to parse keybindings.json: ' + error.message);
            }
        }
    }

module.exports = {
    getKeybindings,
    getSpellsForPage,
    getAllPagesFromMap,
    saveKeybinding,
    revealKeybinding,
};
