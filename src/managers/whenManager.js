const vscode = require("vscode");
const Settings = require("../managers/settingsManager");

/**
 * serialize a mapPage into a when clause context for the keybindings
 * @param {string} mapPage the name of the Page
 * @returns {string} the when context to be used for the keybinding
 */
function serializer(mapPage) {
  return `${Settings.keys.maraudersMapPrefix}.${mapPage.replaceAll(" ", "_")}`;
}

// |-----------------------------------------------------------|
// |        Well ok, TECHNICALLY, this is the MAGIC ...        |
// |-----------------------------------------------------------|

let currentContext;
class ContextCache {
  add(context){
    this[context.contextName] = context
  }
  get(contextName){
    if (this.has(contextName)){
      return this[contextName]
    } else {
      return new WhenContext(contextName)
    }
  }
  has(contextName){
    return contextName in this
  }
  get currentContext(){
    return this._currentContext
  }
  set currentContext(context){
    this._currentContext = context
  }
}
const cache = new ContextCache()

class WhenContext {
  _isSet = false;
  constructor(contextName) {
    //console.log('when: new WhenContext:', contextName);
    this.contextName = contextName;
    cache.add(this);
    return this;
  }
  get isSet(){
    return this._isSet
  }
  set isSet(bool){
    this._isSet = bool
  }
  set(){
    if (!this.isSet){
      //console.log('when: setting:',this.contextName);
      vscode.commands.executeCommand(
        "setContext",
        this.contextName,
        true
      );
      this.isSet = true;
    }
  }
  remove(){
    if (this.isSet){
      //console.log('when: removing:',this.contextName);
      vscode.commands.executeCommand(
        "setContext",
        this.contextName,
        false
      );
      this.isSet = false;
    }
  }
}

new WhenContext(Settings.keys.mapIsActive);
new WhenContext(Settings.keys.mapIsVisible);
new WhenContext(Settings.keys.selectingMapPage);

function removeMapIsActiveOnExit(whenContext){
  if (cache.currentContext && cache.currentContext.contextName === whenContext.contextName){
    const isActiveContext = cache.get(Settings.keys.mapIsActive)
    if (isActiveContext.isSet){
      isActiveContext.remove()
    }
  }
}

function activatePage(mapPage) {
  // set maraudersMapIsActive Context
  const isActiveContext = cache.get(Settings.keys.mapIsActive)
  isActiveContext.set()

  // set mapPage Context
  const contextName = serializer(mapPage);
  const whenContext = cache.get(contextName)
  cache.currentContext = whenContext
  whenContext.set()

  function removePageContext(){
    if (whenContext.isSet){
      whenContext.remove()
    }
  }
  function removeMapIsActiveContext(){
    removeMapIsActiveOnExit(whenContext)
  }
  return { removePageContext, removeMapIsActiveContext }
}

function setContext(contextName){
  return () => cache.get(contextName).set()
}
function removeContext(contextName){
  return () => cache.get(contextName).remove()
}

module.exports = {
  serializer,
  activatePage,

  setSelectingMapPageContext: setContext(Settings.keys.selectingMapPage),
  removeSelectingMapPageContext: removeContext(Settings.keys.selectingMapPage),
  setMapIsVisibleContext: setContext(Settings.keys.mapIsVisible),
  removeMapIsVisibleContext: removeContext(Settings.keys.mapIsVisible)
};
