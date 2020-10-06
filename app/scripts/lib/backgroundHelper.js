const settingsUtils = require('./utils/settingsUtils')

var browser = require("webextension-polyfill");

module.exports = {
    installOrUpgradeStorage: async () => {
        browser.runtime.onInstalled.addListener(async (details) => {
            if (details.reason == 'install') {
                await settingsUtils.setSettings()
                brwoser.runtime.openOptionsPage();
            }
            if (details.reason == 'update') {
                let settings = await settingsUtils.getSettings()
                await settingsUtils.setSettings(settings)
            }
            return
        })
    }
}