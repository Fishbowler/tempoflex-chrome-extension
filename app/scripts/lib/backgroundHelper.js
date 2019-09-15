const chromeUtils = require('./chromeUtils')
module.exports = {
    installOrUpgradeStorage: async () => {
        chrome.runtime.onInstalled.addListener(async (details) => {
            if (details.reason == 'install') {
                await chromeUtils.setSettings()
            }
            if (details.reason == 'update') {
                await chromeUtils.getSettings()
                    .then(settings => {
                        chromeUtils.setSettings(settings)
                    })
            }
        })
    }
}