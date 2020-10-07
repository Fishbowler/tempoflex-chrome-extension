const defaults = require('../defaults.js')

const getSettings = async() => {

    const keys = Object.keys(defaults)
    const settings = await browser.storage.sync.get(keys)

    if (browser.runtime.lastError) {
        console.warn(browser.runtime.lastError);
        throw new Error('Failed to get settings from Browser Storage')
    } else if (!settings) {
        console.warn('Failed to get settings - Empty settings returned')
       throw new Error('Check your settings!')
    } else {
        return Object.assign({}, defaults, settings)
    }
}

const setSettings = async(settings = defaults) => {
        
    await browser.storage.sync.set(settings)

    if (browser.runtime.lastError) {
        console.warn(browser.runtime.lastError);
        throw new Error('Failed to write settings to Browser Storage')
    }
}

module.exports = {
    getSettings,
    setSettings
}