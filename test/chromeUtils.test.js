const chromeUtils = require('../app/scripts/lib/chromeUtils')
const chrome = require('sinon-chrome/extensions');

const testSettings = {
    jiraBaseUrl: 'https://jira.testcorp.net',
    periods: 3,
    username: 'a.smith'
}

describe('Get Settings', ()=>{

    beforeAll(function () {
        global.chrome = chrome;
        chrome.storage.sync.get.yields(testSettings)
    })
    
    it('will use chrome API to get settings', async () => {
        expect(chrome.storage.sync.get.notCalled).toBe(true)
        await chromeUtils.getSettings()
        expect(chrome.storage.sync.get.calledOnce).toBe(true)
    })

    it('will return the correct URL and username', async ()=>{
        const settings = await chromeUtils.getSettings()
        expect(settings.jiraBaseUrl).toBe(testSettings.jiraBaseUrl)
        expect(settings.username).toBe(testSettings.username)
    })

    it('will return the correct number of periods', async ()=>{
        const monthOfTheYear = (new Date()).getMonth() + 1
        const settings = await chromeUtils.getSettings()
        expect(settings.periods).toBe(monthOfTheYear)
    })
})