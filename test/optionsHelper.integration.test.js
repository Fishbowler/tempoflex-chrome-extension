const testFixtures = require('./_fixtures')
const chrome = require('sinon-chrome/extensions')
const optionsHelper = require('../app/scripts/lib/optionsHelper')


describe('Loading Options', ()=>{
    beforeAll(()=>{
        global.chrome = chrome;
        chrome.storage.sync.get.yields(testFixtures.settings)
    })
    it('will retrieve my settings', async ()=>{
        expect(chrome.storage.sync.get.notCalled).toBe(true)
        const doc = new DOMParser().parseFromString(testFixtures.optionsPage.regular, 'text/html')
        optionsHelper.restoreOptions(doc)
        expect(chrome.storage.sync.get.calledOnce).toBe(true)
        expect(doc.getElementById('jiraURL').value).toBe(testFixtures.settings.jiraBaseUrl)
        expect(doc.getElementById('username').value).toBe(testFixtures.settings.username)
        expect(doc.getElementById('hoursPerDay').value).toBe(testFixtures.settings.hoursPerDay.toString())
    })
})

describe('Saving Options', ()=>{
    beforeAll(()=>{
        global.chrome = chrome;
        chrome.storage.sync.set.callsArg(1)
        jest.useFakeTimers()
    })

    afterAll(()=>{
        jest.useRealTimers()
    })
    
    it('will save my settings', async ()=>{
        expect(chrome.storage.sync.set.notCalled).toBe(true)
        const doc = new DOMParser().parseFromString(testFixtures.optionsPage.regular, 'text/html')
        optionsHelper.saveOptions(doc)
        expect(chrome.storage.sync.set.calledOnce).toBe(true)
        expect(doc.getElementById('saved').textContent).toBe('Options saved.')
        jest.runAllTimers()
        expect(doc.getElementById('saved').textContent).toBe('')
    })
})