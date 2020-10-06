const defaults = require('../defaults.js')

const getSettings = () => {
    return new Promise((resolve, reject) => {
        const keys = Object.keys(defaults)
        chrome.storage.sync.get(keys, (settings) => {
            if (chrome.runtime.lastError) {
                console.warn(chrome.runtime.lastError);
                reject(new Error('Failed to get settings from Chrome Storage'))
            } else if (!settings) {
                console.warn('Failed to get settings - Empty settings returned')
                reject(new Error('Check your settings!'))
            } else {
                resolve(Object.assign({}, defaults, settings))
            }
        })
    })
}

const setSettings = (settings = defaults) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(settings, () => {
            if (chrome.runtime.lastError) {
                console.warn(chrome.runtime.lastError);
                reject(new Error('Failed to write settings to Chrome Storage'))
            } else {
                resolve()
            }

        })
    })
}

module.exports = {
    getSettings,
    setSettings
}