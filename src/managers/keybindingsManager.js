const fs = require('fs');
const os = require('os');
const path = require('path');
const vscode = require('vscode');
const jsonc = require('jsonc-parser');
const {maraudersMapPrefix, COMMANDS} = require('../constants');

/**
 * Function to determine if the extension is running in VSCodium or VS Code.
 * @returns {boolean} true if running in VSCodium, false if running in VS Code.
 */
function isVSCodium() {
  return vscode.env.appName.includes('VSCodium');
}


function getPathToKeybindingsFile() {
  const platform = os.platform();
  const baseFolder = isVSCodium() ? 'VSCodium' : 'Code';  // change directory name based on application

    // console.log('---------------');
    // console.log('platform',platform);
    // console.log('isVSCodium',isVSCodium());
    // console.log('baseFolder',baseFolder);

  switch (platform) {
    case 'darwin': // macOS
      return path.join(os.homedir(), 'Library', 'Application Support', baseFolder, 'User', 'keybindings.json');
    case 'win32': // Windows
      return path.join(process.env.APPDATA || '', baseFolder, 'User', 'keybindings.json');
    case 'linux': // Linux
      return path.join(os.homedir(), '.config', baseFolder, 'User', 'keybindings.json');
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
    const data = fs.readFileSync(getPathToKeybindingsFile(), 'utf8');
    const keybindings = jsonc.parse(data);
    return keybindings;
  } catch (error) {
    console.error('Error reading keybindings.json:', error);
    return [];
  }
}


/**
 * Function to filter an array of keybindings by the provided mapPage
 * @param {array} keybindings an array of keybindings parsed from keybindings.json
 * @param {string} mapPage the value to filter the keybindings by
 * @returns {array} the filtered keybindings
 */
function getSpellsForPage(keybindings, mapPage) {
        return keybindings.filter(kb => {
					return kb.when && kb.when.startsWith(maraudersMapPrefix) && kb.when.endsWith(mapPage)
				}).map(kb => {
					return createSpellFromKeyBinding(kb);
				})
}

function createSpellFromKeyBinding(kb) {
  const args = kb.args

  //  "cmd+alt+e" => "⌘⌥E"
  let key = kb.key.toUpperCase()
  .replace('CMD','⌘')
  .replace('ALT','⌥')
  .replace("CTRL",'^')
  .replace('+','')

  let label = `${args.label ? args.label : args.command} (${key})`

  return {
    ...kb.args,
    label
  }
}

/**
 * Function to find the mapPage keybinding for this page
 * @param {array} keybindings an array of keybindings parsed from keybindings.json
 * @param {string} mapPage the page to find the keybinding for
 * @returns {object} the keybinding obj saved for this mapPage
 */
function getPageKeybinding(keybindings, mapPage) {

}

/**
 * Function to gather all mapPages created by the user
 * @param {array} keybindings an array of keybindings parsed from keybindings.json
 * @returns {array} - A list of map pages.
*/
function getAllMapPages(keybindings) {
  // Use a Set to store unique mapPage values
  const mapPages = new Set();
  keybindings.forEach(keybinding => {
    if (keybinding.command === COMMANDS.openMap) {
          if (keybinding.args?.mapPage) {
              mapPages.add(keybinding.args.mapPage);
          }
      } else if(keybinding.command === COMMANDS.closeMap && keybinding.args?.command === COMMANDS.openMap){
          const nestedArgs = keybinding.args.args;
          if (nestedArgs && nestedArgs.mapPage) {
              mapPages.add(nestedArgs.mapPage);
          }
      }
  });
  // Convert the Set back to an array
  return Array.from(mapPages);
}


/**
 * Function to write a new keybinding to the keybindings.json file with a backup and preserve comments.
 * @param {Object} newKeybinding - The new keybinding object to add.
 */
function saveKeybinding(newKeybinding) {
  const keybindingsPath = getPathToKeybindingsFile();
  const backupPath = keybindingsPath + '.backup';

  try {

      const currentContent = fs.readFileSync(keybindingsPath, 'utf8');
      fs.writeFileSync(backupPath, currentContent);

      // Parse the JSONC content preserving comments
      const currentKeybindings = jsonc.parse(currentContent) || [];
      const edits = jsonc.modify(currentContent, [currentKeybindings.length], newKeybinding, { formattingOptions: { insertSpaces: true, tabSize: 2 } });

      // Apply the edits to the original content to get the new content with the comment preserved
      const newContent = jsonc.applyEdits(currentContent, edits);

      // Write the updated content back to keybindings.json
      fs.writeFileSync(keybindingsPath, newContent, 'utf8');

  } catch (error) {
      console.error('Error writing to keybindings.json:', error);
  }
}

module.exports = {
  getKeybindings,
  getSpellsForPage,
  getPageKeybinding,
  getAllMapPages,
  saveKeybinding
};
