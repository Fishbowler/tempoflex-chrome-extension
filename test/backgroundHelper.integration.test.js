const testFixtures = require('./_fixtures')
const browser = require('sinon-chrome/extensions')
const backgroundHelper = require('../app/scripts/lib/backgroundHelper')
const defaults = require('../app/scripts/lib/defaults')

describe('Post-Install Actions', ()=>{
    beforeAll(()=>{
        browser.runtime.id = "testid";
        global.browser = browser;
    })

    beforeEach(()=>{

        browser.storage.sync.get.reset()
        browser.storage.sync.get.yields(defaults)
        browser.storage.sync.set.reset()
        browser.storage.sync.set.callsArg(1)
        browser.runtime.onInstalled.removeListeners()
        browser.runtime.lastError = null
        browser.runtime.sendMessage.flush();
    })

    it('should subscribe to install notifications', ()=>{
        backgroundHelper.installOrUpgradeStorage()
        expect(browser.runtime.onInstalled.addListener.calledOnce).toBe(true)
    })

    it('should set settings to defaults when installed for the first time', ()=>{
        backgroundHelper.installOrUpgradeStorage()
        expect(browser.storage.sync.set.notCalled).toBe(true)
        browser.runtime.onInstalled.trigger({reason: 'install'})
        expect(browser.storage.sync.set.callCount).toBe(1)
        expect(browser.storage.sync.set.calledWithMatch(defaults)).toBe(true)
    })

    it('should set settings to defaults when upgrading with no changes', async ()=>{
        backgroundHelper.installOrUpgradeStorage()
        expect(browser.storage.sync.get.notCalled).toBe(true)
        expect(browser.storage.sync.set.notCalled).toBe(true)

        browser.runtime.onInstalled.trigger({reason: 'update'})
        
        expect(browser.storage.sync.get.callCount).toBe(1)
        await (()=>{return new Promise(resolve => {
            return setTimeout(resolve, 50);
        })}) //Hacky pause to await the chain of awaits :vomit:
        expect(browser.storage.sync.set.callCount).toBe(1)
        expect(browser.storage.sync.set.calledWithMatch(defaults)).toBe(true)
    })

    it.skip('should fail gracefully with an error if chrome storage is unavailable', async ()=>{
        backgroundHelper.installOrUpgradeStorage()
        browser.runtime.lastError = 'Potato storage'

        browser.runtime.onInstalled.trigger({reason: 'update'})
        //TODO: Well now what?
    })


})