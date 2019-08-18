const testFixtures = require('./_fixtures')

describe('defaults', ()=>{
    const defaults = require('../app/scripts/lib/defaults')
    it('will have all of the required defaults', ()=>{
        const settingsKeys = Object.keys(testFixtures.settings).sort()
        const defaultKeys = Object.keys(defaults).sort()
        expect(defaultKeys).toEqual(settingsKeys)
    })
})