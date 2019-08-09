const rewire = require('rewire')
const stringUtils = require('../app/scripts/lib/stringUtils')

const testSettings = {
    jiraBaseUrl: 'https://jira.testcorp.net',
    periods: 3,
    username: 'a.smith',
    hoursPerDay: 8
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
    it('will return an empty string for zero', ()=>{
        const flexDirection = getFlexDirectionText(0)
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
        const printerText = stringUtils.convertFlexToString(seconds, testSettings.hoursPerDay)
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