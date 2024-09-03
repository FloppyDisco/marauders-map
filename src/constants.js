const maraudersMapPrefix = "MaraudersMap";

const mapIcon = "🗺️"

const SETTINGS = {
    defaultMapDelay: {
        key: "defaultMapDelay",
        value: 1500
    },
    mapOpenContext: "MaraudersMapIsOpen",
    inputBoxTitle:`The Marauders Map ${mapIcon}`,
    mapIcon: mapIcon,
    pagesIcon: "$(files)",
    subpagesIcon: "$(arrow-right)",
}

const COMMANDS = {
    saveSpell: `${maraudersMapPrefix}.expectoPatronum`,
    deleteSpell: `${maraudersMapPrefix}.obliviate`,
    openMap:  `${maraudersMapPrefix}.iSolemnlySwearThatIAmUpToNoGood`,
    closeMap:  `${maraudersMapPrefix}.mischiefManaged`,
    displayMap: `_${maraudersMapPrefix}.lumos`,
    revealSpell: `${maraudersMapPrefix}.accio`,
    // erecto
    // prior incantatoAccioAccio
}

module.exports = {
    maraudersMapPrefix,
    SETTINGS,
    COMMANDS,
}
