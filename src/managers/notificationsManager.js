const vscode = require("vscode");
const Settings = require("../managers/settingsManager");

async function showTimedNotification({ message }){
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            cancellable: false
        },
        async (progress) => {
            progress.report({message: `${message}` });
            await new Promise((resolve) => setTimeout(resolve, 8000));
        }
    );
}

function newPage(newPageKeybinding){
    const encodedKeybinding = encodeURIComponent(JSON.stringify(newPageKeybinding));
    const pageName = newPageKeybinding.args.mapPage
    const message = `[${pageName}](command:${
        // link to reveal the Page in keybindings.json
        Settings.keys.commands.revealKeybinding}?${encodedKeybinding
    }) was added to the Map!${
        newPageKeybinding.key
        ? ` Open this Page with ${Settings.prettifyKey(newPageKeybinding.key)}`
        : ""
    }`;
    showTimedNotification({message});
}

function newSpell(newSpellKeybinding){
    const encodedKeybinding = encodeURIComponent(JSON.stringify(newSpellKeybinding));
    const mapPage = newSpellKeybinding.when.split("||")[0].trim().split(".")[1].replaceAll("_"," ")
    let spellName;
    if (newSpellKeybinding.command === "separator") {
        spellName = `${newSpellKeybinding.args.label ? `Separator: ${newSpellKeybinding.args.label}` : "A separator"}`
    } else if (newSpellKeybinding.args.command === Settings.keys.commands.openMapPage) {
        spellName = `Go To ${newSpellKeybinding.args.args.mapPage}`
    } else {
        spellName = `${newSpellKeybinding.args.label ? newSpellKeybinding.args.label : newSpellKeybinding.args.command}`
    }
    const message = `[${spellName}](command:${
        // link to reveal the Spell in keybindings.json
        Settings.keys.commands.revealKeybinding}?${encodedKeybinding
    }) was added to ${mapPage}!${
        newSpellKeybinding.key
        ? ` Call this with ${Settings.prettifyKey(newSpellKeybinding.key)}`
        : ""
    }`;
    showTimedNotification({message});
}

function confirm({message, detail, button}) {
    return vscode.window.showInformationMessage(
        message,
        {modal: true, detail},
        button
    )
}

module.exports = {
    newPage,
    newSpell,
    confirm,
};
