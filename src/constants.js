const maraudersMapPrefix = "MaraudersMap";

const SETTINGS = {
    defaultMapDelay: {
        key: "defaultMapDelay",
        value: 1500
    },
    mapIcon: "🗺️",
    compassIcon: "🧭",

}

const COMMANDS = {
    saveSpell: `${maraudersMapPrefix}.expectoPatronum`,
    deleteSpell: `${maraudersMapPrefix}.obliviate`,
    startSpell:  `${maraudersMapPrefix}.iSolemnlySwearThatIAmUpToNoGood`,
    endSpell:  `${maraudersMapPrefix}.mischiefManaged`,
    displayMap: `_${maraudersMapPrefix}.lumos`
    // accio
    // erecto
    // prior incantato
}

module.exports = {
    maraudersMapPrefix,
    SETTINGS,
    COMMANDS,
}
