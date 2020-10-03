const testFixtures = require('./_fixtures')
const chrome = require('sinon-chrome/extensions')
const optionsHelper = require('../app/scripts/lib/optionsHelper')

const fs = require('fs')
const optionsPage = fs.readFileSync('./app/options.html', {encoding:'utf8'})

describe('Loading Options', ()=>{
    const defaultSettings = testFixtures.settings.builder().build()

    beforeAll(()=>{
        global.chrome = chrome
    })

    beforeEach(()=>{
        chrome.storage.sync.get.reset()
        chrome.storage.sync.get.yields(defaultSettings)
        chrome.runtime.lastError = null
        chrome.runtime.getManifest.returns({version: '0.0.1'})
    })

    it('will retrieve my settings', async ()=>{
        expect(chrome.storage.sync.get.notCalled).toBe(true)
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        await optionsHelper.restoreOptions(doc)
        expect(chrome.storage.sync.get.calledOnce).toBe(true)
        expect(doc.getElementById('jiraURL').value).toBe(defaultSettings.jiraBaseUrl)
        expect(doc.getElementById('username').value).toBe(defaultSettings.username)
        expect(doc.getElementById('hoursPerDay').value).toBe(defaultSettings.hoursPerDay.toString())
        expect(doc.getElementById('useStartDate').checked).toBe(defaultSettings.useStartDate)
        expect(doc.getElementById('startDate').value).toBe(defaultSettings.startDate.toString())
    })

    it('will show developer mode when enabled', async()=>{
        const devModeSettings = testFixtures.settings.builder()
                                    .withProperty('developerSettingsVisible', true)
                                    .build()
        chrome.storage.sync.get.yields(devModeSettings)
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        await optionsHelper.restoreOptions(doc)
        expect(chrome.storage.sync.get.calledOnce).toBe(true)
        expect(doc.getElementById('developerModeWrapper').style.display).toBe('block')
        expect(doc.getElementById('developerModeEnabled').checked).toBe(devModeSettings.developerModeEnabled)
    })

    it('will enable developer mode when clicks occur', async()=>{
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        await optionsHelper.restoreOptions(doc)
        expect(chrome.storage.sync.get.calledOnce).toBe(true)
        expect(doc.getElementById('developerModeWrapper').style.display).toBe('none')
        doc.getElementById('version').click()
        doc.getElementById('version').click()
        doc.getElementById('version').click()
        doc.getElementById('version').click()
        doc.getElementById('version').click()
        expect(doc.getElementById('developerModeWrapper').style.display).toBe('block')
    })

    
})

describe('Saving Options', ()=>{
    beforeAll(()=>{
        global.chrome = chrome;
        jest.useFakeTimers()
    })

    beforeEach(()=>{
        chrome.storage.sync.set.reset()
        chrome.storage.sync.set.callsArg(1)
        chrome.permissions.request.reset()
        chrome.permissions.request.callsArgWith(1, true)
        chrome.runtime.lastError = null
    })

    afterAll(()=>{
        jest.useRealTimers()
    })

    it('will save my settings', async ()=>{
        expect(chrome.storage.sync.set.notCalled).toBe(true)
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        doc.getElementById('jiraURL').value = 'https://jira.example.net'
        await optionsHelper.saveOptions(doc)
        expect(doc.getElementById('saved').textContent).toBe('Options saved.')
        expect(chrome.storage.sync.set.calledOnce).toBe(true)
        jest.runAllTimers()
        expect(doc.getElementById('saved').innerHTML).toBe('&nbsp;')
    })

    it('will not save settings with an invalid Jira URL', async ()=>{
        expect(chrome.storage.sync.set.notCalled).toBe(true)
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        doc.getElementById('jiraURL').value = 'potato'
        await optionsHelper.saveOptions(doc)
        expect(doc.getElementById('saved').textContent).toBe('Invalid Jira URL')
        expect(chrome.storage.sync.set.notCalled).toBe(true)
        jest.runAllTimers()
        expect(doc.getElementById('saved').innerHTML).toBe('&nbsp;')
    })

    it('will prompt for new permissions when a new Jira URL', async () =>{
        expect(chrome.permissions.request.notCalled).toBe(true)
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        doc.getElementById('jiraURL').value = 'https://jira.example.net'
        await optionsHelper.saveOptions(doc)
        expect(chrome.permissions.request.calledOnce).toBe(true)
    })

    it('will log to console when new permissions are rejected', async () =>{
        const originalConsoleLog = global.console.log
        global.console.log = jest.fn()

        chrome.permissions.request.callsArgWith(1, false)
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        doc.getElementById('jiraURL').value = 'https://jira.example.net'
        await optionsHelper.saveOptions(doc)
        expect(chrome.permissions.request.calledOnce).toBe(true)
        expect(global.console.log).toHaveBeenCalledWith('Failed to get permission to use https://jira.example.net/* - maybe the user rejected it?')

        global.console.log = originalConsoleLog

    })
})