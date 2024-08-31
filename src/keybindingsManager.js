const fs = require('fs');
const os = require('os');
const path = require('path');
const vscode = require('vscode');
const jsonc = require('jsonc-parser');

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

module.exports = {
  getKeybindings,
  saveNewKeybinding
};
