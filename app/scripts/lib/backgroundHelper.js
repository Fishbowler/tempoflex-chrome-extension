const chromeUtils = require('./chromeUtils')
module.exports = {
    installOrUpgradeStorage: async () => {
        chrome.runtime.onInstalled.addListener(async (details) => {
            if (details.reason == 'install') {
                await chromeUtils.setSettings()
            }
            if (details.reason == 'update') {
                let settings = await chromeUtils.getSettings()
                await chromeUtils.setSettings(settings)
            }
            return
        })
    }
}