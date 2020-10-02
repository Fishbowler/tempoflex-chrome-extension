import * as testFixtures from './_fixtures'
import * as chrome from 'sinon-chrome/extensions'
import * as backgroundHelper from '../app/scripts/lib/backgroundHelper'
import defaults from '../app/scripts/lib/defaults'

describe('Post-Install Actions', ()=>{
    beforeAll(()=>{
        global.chrome = chrome;
    })

    beforeEach(()=>{
        chrome.storage.sync.get.reset()
        chrome.storage.sync.get.yields(defaults)
        chrome.storage.sync.set.reset()
        chrome.storage.sync.set.callsArg(1)
        chrome.runtime.onInstalled.removeListeners()
        chrome.runtime.lastError = null
        chrome.runtime.sendMessage.flush();
    })

    it('should subscribe to install notifications', ()=>{
        backgroundHelper.installOrUpgradeStorage()
        expect(chrome.runtime.onInstalled.addListener.calledOnce).toBe(true)
    })

    it('should set settings to defaults when installed for the first time', ()=>{
        backgroundHelper.installOrUpgradeStorage()
        expect(chrome.storage.sync.set.notCalled).toBe(true)
        chrome.runtime.onInstalled.trigger({reason: 'install'})
        expect(chrome.storage.sync.set.callCount).toBe(1)
        expect(chrome.storage.sync.set.calledWithMatch(defaults)).toBe(true)
    })

    it('should set settings to defaults when upgrading with no changes', async ()=>{
        backgroundHelper.installOrUpgradeStorage()
        expect(chrome.storage.sync.get.notCalled).toBe(true)
        expect(chrome.storage.sync.set.notCalled).toBe(true)

        chrome.runtime.onInstalled.trigger({reason: 'update'})
        
        expect(chrome.storage.sync.get.callCount).toBe(1)
        await (()=>{return new Promise(resolve => {
            return setTimeout(resolve, 50);
        })}) //Hacky pause to await the chain of awaits :vomit:
        expect(chrome.storage.sync.set.callCount).toBe(1)
        expect(chrome.storage.sync.set.calledWithMatch(defaults)).toBe(true)
    })

    it.skip('should fail gracefully with an error if chrome storage is unavailable', async ()=>{
        backgroundHelper.installOrUpgradeStorage()
        chrome.runtime.lastError = 'Potato storage'

        chrome.runtime.onInstalled.trigger({reason: 'update'})
        //TODO: Well now what?
    })


})