# The Marauder's Map

The Marauder's Map is the magical guide that can show you where everything and everyone is at Hogwarts!

## Features

Add Pages to your very own Marauder's Map, where you can write down your most cherished spells.
Give each spell a unique key to cast quickly when you need it.
But don't worry, should you forget how to perform your favorite wizardings,
the Marauder's Map will be there to show you the way **!**

## Usage

-   install the extension,
-   open the command palette and type in `open map`
-   select the command to open the map!
-   add your first page to the map by selecting `+ New Page`
-   enter a name for your page
-   choose a keybinding that will open this page of the map
-   select your first spell to add to your new page
-   give your spell a keybinding to make it quick to use
-   write down a custom label for your spell so you'll remember exactly what it does

## Implementation

this extension works by reading and writing keybindings from keybindings.json
it doesn't really add any special sauce, it just manages keybindings using custom "when" clauses.
but then again, the best magic tricks are usually the least complicated ones...

## Tips!

you may notice that some keybindings will not work immediately after opening a page of the map,
but then the keybinding will work once the map has opened. this is probably because of a conflicting
keybinding and the focus has not shifted yet.
for example:

-   (cmd+e) opens "editor" page.
-   (cmd+m) calls Maximize editor group inside of the "editor" page.
-   (cmd+m) toggles bookmark

pressing cmd+e and then cmd+m before the map opens toggles the bookmark instead of maximizing the editor group.
it has to do with the particular when clause and focus of the editor.
you can fix this by putting "!MaraudersMapIsOpen" the when clause of the global "toggle bookmark" command.
then vscode will not select this command once a page is opened.

## BUGS

-   if you set a command for a page to be something with the escape key, (cmd+escape) or some like variation, it will work as expected, UNTIL the map opens. Once the map is open the escape key gets slaved to closing the quickPicker, and while pressing (cmd+escape) will not close the picker, it also will not run your command. The command can still be run by selecting it manually in the picker and pressing "Enter". I do not know of a fix for this, sorry.

### The Problem

Honestly, the organization of keybindings in vscode pretty much sucks by default.

And no, the anwer is not vim.

How many keybindings are hidden behind the (ctrl+k) chord... nobody knows!

And how many different Fold commands are there?!?

And calling the command palette to type the desired command in is inefficient.

### The Solution

This extension allows you to create
"pages/menus/groups" (whatever you want to call them)
of keybindings that are related to eachother.
When a keybinding group is called,
you can then press the keybinding for any of the
commands in that group immediately,
but if you are struggling to remember the exact
command you want, a quickPick Box will pop up to
prompt you with the available options for that group.

**One group can call another group...**

Which means:

-   you can nest your keybindings as deep as you want
-   you're not limited to just one chord like the default keybindings

(ctrl+E) opens your "Editor" group and
(ctrl+F) calls your desired fold command.
This means your workflow doesn't really change
from the default behavior, but with this extension
you can now nest deeper and be given a
visual prompt if desired. Maybe you want (ctrl+F)
to bring up a menu of ALL Fold commands. Now it can!
customize your keybindings however you want.

**Keybindings are scoped to each group**

so you can reuse commonly used letters over and over again without conflicts.
this means you can always use the letter that the
command starts with, or you can always have the menu
items assigned to your home row keys, or 1, 2, 3, 4, etc.

This extension doesn't fix all the problems of how
keybindings work in vscode by default,
but it fixes ONE of the problems.
Sky's the limit now, go make the magic happen.

## _You're a Wizard Harry ..._

example keybindings:

```
{
    {
        "mapPage": "thisPage",
        "key": "cmd+f",
        "nestedUnder": "otherPage", // if this is undefined it wont show.
        "label": "${SETTINGS.pagesIcon} ThisPage (cmd+f)", => generate with pretifyKey
    },
    {
        "key": "cmd+e",
        "command": "MaraudersMap.iSolemnlySwearThatIAmUpToNoGood",
        "when": "!MaraudersMapIsOpen",
        "args": {
            "mapPage": "Editor",
            "mapDelay": 300, // if a number is set it will be used if not, default will be used
        }
    },
    {
        "key": "cmd+,",
        "command": "MaraudersMap.mischiefManaged",
        "when" : "MaraudersMap.editor",
        "args": {
            "label": "Split Editor Down"
            "command": "editor.splitDown",
        }
    },
}
```
