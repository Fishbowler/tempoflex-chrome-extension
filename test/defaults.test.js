describe('defaults', ()=>{
    const defaults = require('../app/scripts/lib/defaults')
    it('will have all of the required defaults', ()=>{
        expect(Object.keys(defaults).sort()).toEqual([
            'hoursPerDay',
            'jiraBaseUrl',
            'periods',
            'username'
        ])
    })
})