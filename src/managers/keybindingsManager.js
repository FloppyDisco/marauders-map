const fs = require('fs');
const os = require('os');
const path = require('path');
const vscode = require('vscode');
const jsonc = require('jsonc-parser');
const {maraudersMapPrefix} = require('../constants');

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

// Function to read the keybindings.json file
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

// Function to write a new keybinding to the keybindings.json file
function saveNewKeybinding(newKeybinding) {
  const keybindingsPath = getPathToKeybindingsFile();

  try {
    const currentKeybindings = getKeybindings();
    currentKeybindings.push(newKeybinding);

    fs.writeFileSync(keybindingsPath, JSON.stringify(currentKeybindings, null, 2));
    console.log('Keybinding added successfully.');
  } catch (error) {
    console.error('Error writing to keybindings.json:', error);
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
					return { ...kb.args, key: kb.key }
				}).map(kb => {

					// modify keybinding to be more visually appealing
					// create a label if one does not exist
					kb.label = `${kb.label} (${kb.key})`
					return kb
				})

}

/**
 * Function to find the mapPage keybinding for this page
 * @param {array} keybindings an array of keybindings parsed from keybindings.json
 * @param {string} mapPage the page to find the keybinding for
 * @returns {object} the keybinding obj saved for this mapPage
 */
function getMapPageKeybinding(keybindings, mapPage) {

}

/**
 * Function to gather all mapPages created by the user
 * @param {array} keybindings an array of keybindings parsed from keybindings.json
 * @returns {array} an array of all mapPage keybindings
 */
function getAllMapPages(keybindings) {

}


module.exports = {
  getKeybindings,
  getSpellsForPage,
  getMapPageKeybinding,
  getAllMapPages,
  saveNewKeybinding
};
