const rewire = require('rewire')
const stringUtils = require('../app/scripts/lib/stringUtils')

const testSettings = {
    jiraBaseUrl: 'https://jira.testcorp.net',
    periods: 3,
    username: 'a.smith'
}

describe('getFlexDirectionText', ()=>{
    const getFlexDirectionText = rewire('../app/scripts/lib/stringUtils').__get__('getFlexDirectionText')
    it('will return "ahead" for positive numbers', ()=>{
        const flexDirection = getFlexDirectionText(10)
        expect(flexDirection).toBe('ahead')
    })
    it('will return "behind" for negative numbers', ()=>{
        const flexDirection = getFlexDirectionText(-10)
        expect(flexDirection).toBe('behind')
    })
    it('will return "exactly" for zero', ()=>{
        const flexDirection = getFlexDirectionText(0)
        expect(flexDirection).toBe('exactly')
    })
})

describe('flexPrinter', ()=>{
    const expectedOutputs = [
        [1, '1 second ahead'],
        [-1, '1 second behind'],
        [3600, '1 hour ahead'],
        //[3600*7.5, '1 day ahead'] //TODO: Issue #3
        [-61322, '2 days, 2 hours, 2 minutes, 2 seconds behind']
    ]
    it.each(expectedOutputs)('for %i seconds input, will print "%s"', (seconds, expectedPrinterText)=>{
        const printerText = stringUtils.flexPrinter(seconds)
        expect(printerText).toBe(expectedPrinterText)
    })
})

describe('getTempoPeriodsUrl', ()=>{
    it('will return the URL based on the settings', ()=>{
        const periodsUrl = stringUtils.getTempoPeriodsUrl(testSettings)
        expect(periodsUrl).toBe('https://jira.testcorp.net/rest/tempo-timesheets/4/timesheet-approval/approval-statuses/?userKey=a.smith&numberOfPeriods=3')
    })
})

describe('getTempoWorklogsUrl', ()=>{
    it('will return the URL based on the settings', ()=>{
        const worklogsUrl = stringUtils.getTempoWorklogsUrl(testSettings)
        expect(worklogsUrl).toBe('https://jira.testcorp.net/rest/tempo-timesheets/4/worklogs/search')
    })
})