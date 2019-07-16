const chromeUtils = require('../app/scripts/lib/chromeUtils')
const chrome = require('sinon-chrome/extensions');

const testSettings = {
    jiraBaseUrl: 'https://jira.testcorp.net',
    periods: 3,
    username: 'a.smith'
}

describe('Get Settings', ()=>{
    beforeAll(()=>{
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

describe('Failing to get settings', ()=>{

    beforeAll(()=>{
        global.chrome = chrome;
        console.warn=function(){} //hush now, everything will be fine.
    })

    beforeEach(()=>{
        chrome.flush();
        chrome.storage.sync.get.yields(null)
    })

    it('will return an error message when no settings exist', async ()=>{
        expect.assertions(2)
        try{
            await chromeUtils.getSettings()
        } catch(e){
            expect(e).not.toBeNull()
            expect(e.message).toBe('Check your settings!')
        }
    })

    it('will return an error message when it fails to get settings', async ()=>{
        chrome.runtime.lastError = 'potato storage'
        expect.assertions(2)
        try{
            await chromeUtils.getSettings()
        } catch(e){
            expect(e).not.toBeNull()
            expect(e.message).toBe('Failed to get settings from Chrome Storage')
        }
    })
})