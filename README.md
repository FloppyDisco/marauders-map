# The Marauder's Map

The Marauder's Map is a magical guide that shows where all your favorite keyboard shortcuts are!

## Usage

Add Pages to your very own Marauder's Map, where you can write down your most cherished Spells and Charms.

Afterall, the best Witch or Wizard is an organized one!

Give each page a memorable name, and save it to a unique key, so you can open it quickly!

Record your favorite Spells on your Pages, and give each spell a unique key to cast them quickly when you need them.

But don't worry, should you forget how to perform your favorite wizardings,
the Marauder's Map will be there to show you the way **!**

### Installing

-   Install the extension,

-   Press (ctrl+alt+M) on PC, or (⌘⌥M) on Mac, to open the map!

### Setting up

-   Add your first Page to the map by selecting `+New Page`

-   Enter a name for your page

-   Choose a keybinding that will open this page of the map. You can open any of the pages on your map directly without pressing (ctrl+alt+m) or (⌘⌥M) first

-   Add your first Spell to your page by selecting `+New Spell`

-   Choose what you want your spell to do!

-   Give your Spell a keybinding to make it quick to use

-   Write down a custom label for your spell so you'll remember exactly what it does

### Using

-   Press your keybinding to open a specific Page on your Map.

-   The Spells on this Page are immediately available; however, you will notice the Map does not open immediately.

-   The Map is a guide, in case you forget your way.



## Implementation

This extension works by reading and writing keybindings from keybindings.json
it doesn't really add much special sauce, it just manages keybindings using dynamic "when" clauses.
but then again, the best magic tricks are usually the simplest...

## Tips!

### keybindings

When setting a keybinding for a Page or Spell, you must type the keycodes out the way they appear in `keybindings.json`
This was the simplest solution. Separated by "+", no spaces.
example: `ctrl+alt+y`

common keycodes
- `ctrl`
- `cmd`
- `shift`
- `alt`
- `escape`
- `enter`
- `backspace`


### Map Delay Time

The time delay before the map opens is user customizable.

Change the "Map Delay Time" in Settings,

or add `"MaraudersMap.defaultMapDelay": <number>,` in `settings.json`

The value is (ms)

Set `3000` for 3 secs

Alternatively you may add a `"mapDelay"` to the `"args"` of any Page keybinding which will only change the delay time for that Page. Maybe you have groups of commands that you would like to have open immediately.

setting any `"mapDelay"` to `0` will open the Map immediately.

example keybindings:

```
...

{
    "key": "cmd+e",
    "command": "MaraudersMap.iSolemnlySwearThatIAmUpToNoGood",
    "when": "!MaraudersMapIsOpen",
    "args": {
        "mapPage": "Editor",
        "mapDelay": 300,    // optional arg for per-page mapDelay
    }
},
{
    "key": "cmd+,",
    "command": "MaraudersMap.mischiefManaged",
    "when" : "MaraudersMap.Editor",
    "args": {
        "label": "Split Editor Down"
        "command": "editor.splitDown",
    }
},

```

## Coming Soon

- validation on keycode inputs
- bug fix on nested map delay times



## BUGS

#### Cannot change keybingings in keybinding shortcuts UI

Because this extension basically uses a "wrapper" function to work, you will have many keybings in you `keybindings.json` that all point to the same two commands. Because of this, you will not be able to reassign the keybindings using the native "Keyboard Shortcuts" interface, you will have to change them in `keybindings.json` manually. If you want to edit a Spell, click the settings icon for that Spell when the Map is open.

----

#### Cannot use "Esc" once map opens
If you set a command for a page to be something with the escape key, (cmd+escape) or some like variation, it will work as expected, UNTIL the map opens. Once the map is open the escape key gets slaved to closing the quickPicker, and while pressing (cmd+escape) will not close the picker, it also will not run your command. The command can still be run by selecting it manually in the picker and pressing "Enter". I do not know of a fix for this, sorry.

----
#### Keybinding for Spell not immediately available when opening a Page
you may notice that some keybindings will not work immediately after opening a page of the map,
but then the keybinding will work once the map has been displayed. This is most likely due to a conflicting
global keybinding being called before the focus has shifted.

for example:

-   (⌘E) opens a Page of your Map.
-   (⌘M) on this Page calls command "Maximize editor group".
-   (⌘M) *usually* toggles bookmarks

### **If**
pressing (⌘E) and then immediately pressing (⌘M) before the map is displayed toggles the bookmark instead of maximizing the editor group.
### **then**
It has to do with when clause of the conflicting keybinding, it probably is a global keybinding and does not have a when clause.

You can fix this by putting "!MaraudersMapIsOpen" in the when clause of the global "toggle bookmark" command.
Doing this *should* prevent VS Code from selecting the conflicting keybinding once you open a Page, even before the Map is actually displayed.

----

### The Problem

Honestly, the organization of keybindings in vscode pretty much sucks by default.

And no, the anwer is **NOT** Vim.

How many keybindings are hidden behind the (ctrl+k) chord...

Nobody knows!

And also the fact that VS Code calls them "Chords" when they are "Melodies"...

And how many different Fold commands are there?!?

Who knows the difference between any of them!?!

The Command Palette is pretty dope, but typing out what you want for everything just takes forever.

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
-   you're not limited to just one chord... ** cough ** melody... like the default keybindings

(ctrl+E) opens your "Editor" group and
(ctrl+F) calls your desired fold command.
This means your workflow doesn't really change
from the default behavior, but with this extension
you can now nest deeper and be given a
visual prompt if desired. Maybe you want (ctrl+F)
to bring up a menu of ALL Fold commands, now it can!
customize your keybindings however you want.

**Keybindings are scoped to each group**

so you can reuse commonly used letters over and over again without conflicts.
this means you can always use the letter that the
command starts with, or you can always have the menu
items assigned to your home row keys, or 1, 2, 3, 4, etc., whatever you want.



----


#### Why not "Whick Key"?
It's a vim solution to a vscode problem.
also, I don't think it actually manages conflicting keybindings, it says in the docs that you should use "g" instead of "ctrl+g", I don't like this, I

I don't know, it didn't fell whimsical enough for me...

----

This extension doesn't pretend to fix everything about keybindings
in VS Code, but it tries to provide one new feature.

Open to any and all contributions/suggestions. I need all the help I can get!

Hope you find using this extension as entertaining as I found creating it.
Go make the magic happen.

### _You're a Wizard Harry ..._
