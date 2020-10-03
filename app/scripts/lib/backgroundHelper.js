const settingsUtils = require('./settingsUtils')
module.exports = {
    installOrUpgradeStorage: async () => {
        chrome.runtime.onInstalled.addListener(async (details) => {
            if (details.reason == 'install') {
                await settingsUtils.setSettings()
                chrome.runtime.openOptionsPage();
            }
            if (details.reason == 'update') {
                let settings = await settingsUtils.getSettings()
                await settingsUtils.setSettings(settings)
            }
            return
        })
    }
}