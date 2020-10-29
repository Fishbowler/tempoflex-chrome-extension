const testFixtures = require('./_fixtures')
const backgroundHelper = require('../app/scripts/lib/backgroundHelper')
const defaults = require('../app/scripts/lib/defaults')

const webExtensionsJSDOM = require('webextensions-jsdom')
const path = require('path');
const manifestPath = path.resolve(path.join(__dirname, '../app/manifest.json'));

let webExtension

describe('Post-Install Actions', ()=>{
    const defaultSettings = testFixtures.settings.builder().build()

    beforeAll(async()=>{
        webExtension = await webExtensionsJSDOM.fromManifest(manifestPath, {apiFake: true});
        global.browser = webExtension.popup.browser;
    })

    beforeEach(()=>{
        browser.storage.sync.set.reset()
        browser.storage.sync.get.resolves(defaultSettings)
        browser.storage.sync.set.reset()
        browser.storage.sync.set.resolves()
        browser.runtime.openOptionsPage.reset()
        browser.runtime.openOptionsPage.returns()
        browser.runtime.onInstalled.addListener.reset()
        //browser.runtime.onInstalled.removeListeners()
        browser.runtime.lastError = null
        //browser.runtime.sendMessage.flush();
    })

    it('should subscribe to install notifications', ()=>{
        backgroundHelper.installOrUpgradeStorage()
        expect(browser.runtime.onInstalled.addListener.calledOnce).toBe(true)
    })

    it('should set settings to defaults when installed for the first time', ()=>{
        backgroundHelper.installOrUpgradeStorage()
        expect(browser.storage.sync.set.notCalled).toBe(true)
        browser.runtime.onInstalled.addListener.yield({reason: 'install'})
        expect(browser.storage.sync.set.callCount).toBe(1)
        expect(browser.storage.sync.set.calledWithMatch(defaults)).toBe(true)
    })

    it('should open the settings page when installed for the first time', async ()=>{
        backgroundHelper.installOrUpgradeStorage()
        expect(browser.runtime.openOptionsPage.notCalled).toBe(true)
        await browser.runtime.onInstalled.addListener.yield({reason: 'install'})
        await (()=>{return new Promise(resolve => {
            return setTimeout(resolve, 100);
        })}) //Hacky pause to await the chain of awaits :vomit:
        expect(browser.runtime.openOptionsPage.callCount).toBe(1)
    })

    it('should set settings to defaults when upgrading with no changes', async ()=>{
        backgroundHelper.installOrUpgradeStorage()
        expect(browser.storage.sync.get.notCalled).toBe(true)
        expect(browser.storage.sync.set.notCalled).toBe(true)
        await browser.runtime.onInstalled.addListener.yield({reason: 'update'})
        await (()=>{return new Promise(resolve => {
            return setTimeout(resolve, 500);
        })}) //Hacky pause to await the chain of awaits :vomit:
        expect(browser.storage.sync.get.callCount).toBe(1)
        expect(browser.storage.sync.set.callCount).toBe(1)
        expect(browser.storage.sync.set.calledWithMatch(defaultSettings)).toBe(true)
    })

    it.skip('should fail gracefully with an error if chrome storage is unavailable', async ()=>{
        backgroundHelper.installOrUpgradeStorage()
        browser.runtime.lastError = 'Potato storage'
        browser.runtime.onInstalled.trigger({reason: 'update'})
        //TODO: Well now what?
    })


})