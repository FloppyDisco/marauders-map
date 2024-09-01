const maraudersMapPrefix = "MaraudersMap";

const mapIcon = "🗺️"

const SETTINGS = {
    defaultMapDelay: {
        key: "defaultMapDelay",
        value: 1500
    },
    inputBoxTitle:`The Marauder's Map ${mapIcon}`,
    mapIcon: mapIcon,
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
