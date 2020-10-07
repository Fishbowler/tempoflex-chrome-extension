const testFixtures = require('./_fixtures')
const optionsHelper = require('../app/scripts/lib/optionsHelper')

const fs = require('fs')
const optionsPage = fs.readFileSync('./app/options.html', {encoding:'utf8'})

const webExtensionsJSDOM = require("webextensions-jsdom")
const path = require('path');
const manifestPath = path.resolve(path.join(__dirname, '../app/manifest.json'));

let webExtension

describe('Loading Options', ()=>{
    const defaultSettings = testFixtures.settings.builder().build()
    const devModeSettings = testFixtures.settings.builder()
                                    .withProperty('developerSettingsVisible', true)
                                    .build()

    beforeAll(async()=>{
        webExtension = await webExtensionsJSDOM.fromManifest(manifestPath, {apiFake: true});
        global.browser = webExtension.popup.browser;
    })

    beforeEach(()=>{
        browser.storage.sync.get.resolves(defaultSettings)
        browser.storage.sync.get.resetHistory()
        browser.runtime.lastError = null
        browser.runtime.getManifest.returns({version: '0.0.1'})
    })

    it('will retrieve my settings', async ()=>{
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')

        expect(browser.storage.sync.get.notCalled).toBe(true)
        await optionsHelper.restoreOptions(browser.runtime.getManifest().version, doc)
        expect(browser.storage.sync.get.calledOnce).toBe(true)
        expect(doc.getElementById('jiraURL').value).toBe(defaultSettings.jiraBaseUrl)
        expect(doc.getElementById('username').value).toBe(defaultSettings.username)
        expect(doc.getElementById('hoursPerDay').value).toBe(defaultSettings.hoursPerDay.toString())
        expect(doc.getElementById('useStartDate').checked).toBe(defaultSettings.useStartDate)
        expect(doc.getElementById('startDate').value).toBe(defaultSettings.startDate.toString())
    })

    it('will show developer mode when enabled', async()=>{
        browser.storage.sync.get.resolves(devModeSettings)
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        
        expect(browser.storage.sync.get.notCalled).toBe(true)
        await optionsHelper.restoreOptions(browser.runtime.getManifest().version, doc)
        expect(browser.storage.sync.get.called).toBe(true)
        expect(doc.getElementById('developerModeWrapper').style.display).toBe('block')
        expect(doc.getElementById('developerModeEnabled').checked).toBe(devModeSettings.developerModeEnabled)
    })

    it('will enable developer mode when clicks occur', async()=>{
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        await optionsHelper.restoreOptions(browser.runtime.getManifest().version, doc)
        expect(browser.storage.sync.get.calledOnce).toBe(true)
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
    beforeAll(async()=>{
        webExtension = await webExtensionsJSDOM.fromManifest(manifestPath, {apiFake: true});
        global.browser = webExtension.popup.browser;
        jest.useFakeTimers()
    })

    beforeEach(()=>{
        browser.storage.sync.set.resetHistory()
        browser.storage.sync.set.resolves()
        browser.permissions.request.reset()
        browser.permissions.request.resolves(true)
        browser.runtime.lastError = null
    })

    afterAll(()=>{
        jest.useRealTimers()
    })

    it('will save my settings', async ()=>{
        expect(browser.storage.sync.set.notCalled).toBe(true)

        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        doc.getElementById('jiraURL').value = 'https://jira.example.net'
        await optionsHelper.saveOptions(doc)
        
        expect(doc.getElementById('saved').textContent).toBe('Options saved.')
        expect(browser.storage.sync.set.calledOnce).toBe(true)
        jest.runAllTimers()
        expect(doc.getElementById('saved').innerHTML).toBe('&nbsp;')
    })

    it('will not save settings with an invalid Jira URL', async ()=>{
        expect(browser.storage.sync.set.notCalled).toBe(true)

        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        doc.getElementById('jiraURL').value = 'potato'
        await optionsHelper.saveOptions(doc)
        
        expect(doc.getElementById('saved').textContent).toBe('Invalid Jira URL')
        expect(browser.storage.sync.set.notCalled).toBe(true)
        jest.runAllTimers()
        expect(doc.getElementById('saved').innerHTML).toBe('&nbsp;')
    })

    it('will prompt for new permissions when a new Jira URL', async () =>{
        expect(browser.permissions.request.notCalled).toBe(true)

        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        doc.getElementById('jiraURL').value = 'https://jira.example.net'
        await optionsHelper.requestPermissions(doc, doc.getElementById('jiraURL').value)

        jest.runAllTimers()
        expect(browser.permissions.request.calledOnce).toBe(true)
    })

    it('will log to console when new permissions are rejected', async () =>{
        const originalConsoleLog = global.console.log
        global.console.log = jest.fn()

        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        doc.getElementById('jiraURL').value = 'https://jira.example.net'
        browser.permissions.request.resolves(false)
        await optionsHelper.requestPermissions(doc, doc.getElementById('jiraURL').value)

        jest.runAllTimers()
        expect(browser.permissions.request.calledOnce).toBe(true)
        expect(global.console.log).toHaveBeenCalledWith('Failed to get permission to use https://jira.example.net/* - maybe the user rejected it?')

        global.console.log = originalConsoleLog
    })

    it('will fail gracefully when chrome settings storage fails', async () => {
        expect.assertions(2)
        const originalConsoleWarn = global.console.warn
        global.console.warn = jest.fn()

        browser.runtime.lastError = 'Potato!'
        const doc = new DOMParser().parseFromString(optionsPage, 'text/html')
        doc.getElementById('jiraURL').value = 'https://jira.example.net'
        await optionsHelper.saveOptions(doc)
        await (()=>{return new Promise(resolve => {
            return setTimeout(resolve, 50);
        })})
        expect(doc.getElementById('saved').textContent).toBe('Failed to save options')
        expect(global.console.warn).toHaveBeenCalledWith('Potato!')
        
        global.console.warn = originalConsoleWarn
    })
})