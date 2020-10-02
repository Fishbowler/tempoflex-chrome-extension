import * as chromeUtils from './chromeUtils'
import "regenerator-runtime/runtime.js";

export async function installOrUpgradeStorage() {
    chrome.runtime.onInstalled.addListener(async (details) => {
        if (details.reason == 'install') {
            await chromeUtils.setSettings()
            chrome.runtime.openOptionsPage();
        }
        if (details.reason == 'update') {
            let settings = await chromeUtils.getSettings()
            await chromeUtils.setSettings(settings)
        }
        return
    })
}