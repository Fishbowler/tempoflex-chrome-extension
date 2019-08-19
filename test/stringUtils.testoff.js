const rewire = require('rewire')
const stringUtils = require('../app/scripts/lib/stringUtils')
const testFixtures = require('./_fixtures')

describe.skip('getFlexDirectionText', ()=>{
    const getFlexDirectionText = rewire('../app/scripts/lib/stringUtils').__get__('getFlexDirectionText')
    it('will return "ahead" for positive numbers', ()=>{
        const flexDirection = getFlexDirectionText(10)
        expect(flexDirection).toBe('ahead')
    })
    it('will return "behind" for negative numbers', ()=>{
        const flexDirection = getFlexDirectionText(-10)
        expect(flexDirection).toBe('behind')
    })
    it('will return an empty string for zero', ()=>{
        const flexDirection = getFlexDirectionText(0)
        expect(flexDirection).toBe('')
    })
    it('will return an empty string for no input', ()=>{
        const flexDirection = getFlexDirectionText()
        expect(flexDirection).toBe('')
    })
})

describe('convertFlexToString', ()=>{
    const expectedOutputs = [
        [0, 'Your timesheet is balanced!'],
        [1, '1 second ahead'],
        [-1, '1 second behind'],
        [3600, '1 hour ahead'],
        [3600*8, '1 day ahead'],
        [-64922, '2 days, 2 hours, 2 minutes, 2 seconds behind']
    ]
    it.each(expectedOutputs)('for %i seconds input, will print "%s"', (seconds, expectedPrinterText)=>{
        const printerText = stringUtils.convertFlexToString(seconds, testFixtures.settings.hoursPerDay)
        expect(printerText).toBe(expectedPrinterText)
    })
})

describe('getTempoPeriodsUrl', ()=>{
    it('will return the URL based on the settings', ()=>{
        const periodsUrl = stringUtils.getTempoPeriodsUrl(testFixtures.settings)
        expect(periodsUrl).toBe(testFixtures.settings.jiraBaseUrl + testFixtures.periodsUrl)
    })
})

describe('getTempoWorklogsUrl', ()=>{
    it('will return the URL based on the settings', ()=>{
        const worklogsUrl = stringUtils.getTempoWorklogsUrl(testFixtures.settings)
        expect(worklogsUrl).toBe(testFixtures.settings.jiraBaseUrl + testFixtures.worklogSearchUrl)
    })
})