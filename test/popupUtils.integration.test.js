const popupUtils = require('../app/scripts/lib/popupUtils')
const chrome = require('sinon-chrome/extensions');
const nock = require('nock')
const testFixtures = require('./_fixtures')
const timekeeper = require('timekeeper')

describe('getFlex', ()=>{
    beforeAll(()=>{
        global.chrome = chrome;
        global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    })

    beforeEach(()=>{
        chrome.storage.sync.get.reset()
        chrome.storage.sync.get.yields(testFixtures.settings.default)
        chrome.runtime.lastError = null
        nock.cleanAll()
    })

    it('will calculate positive flex on a non-working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan1st) //1st Jan 2019, 15:00
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan1st)
            .reply(200, testFixtures.userSchedules.nonWorkingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.twoPeriods1300Ahead)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, testFixtures.worklogs.twoWorklogs700)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-02', to:'2019-01-31'})
            .reply(200, testFixtures.worklogs.oneWorklog400)
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('15 minutes ahead')
        //1300 from perdiod + 0 for today (because it's not a working day) - 400 logged in the future = 900 = 15 mins
    })

    it('will calculate negative flex on a non-working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan1st) //1st Jan 2019, 15:00

        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan1st)
            .reply(200, testFixtures.userSchedules.nonWorkingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.twoPeriods500Behind)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, testFixtures.worklogs.twoWorklogs700)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-02', to:'2019-01-31'})
            .reply(200, testFixtures.worklogs.oneWorklog400)
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('15 minutes behind')
        //1300 from perdiod + 0 for today (because it's not a working day) - 400 logged in the future = 900 = 15 mins
    })

    it('will calculate flex when balanced at the end of a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, testFixtures.userSchedules.workingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.twoPeriodsBalanced)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.oneWorklog8hourday)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(200, [])
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('Your timesheet is balanced!')
    })

    it('will calculate flex when balanced at the beginning of the first period (no work done)', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan1st)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan1st)
            .reply(200, testFixtures.userSchedules.nonWorkingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.onePeriodEmpty)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, [])
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-02', to:'2019-01-31'})
            .reply(200, [])
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('Your timesheet is balanced!')
    })

    it('will calculate a 1 day flex on a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, testFixtures.userSchedules.workingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.onePeriod1DayAhead)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.oneWorklog8hourday)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(200, [])
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('1 day ahead')
    })

    it('will calculate flex part way through a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, testFixtures.userSchedules.workingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.twoPeriodsBalanced)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.oneWorklog4hours)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(200, [])
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('4 hours ahead')
    })

    it('will calculate a complex negative flex on a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, testFixtures.userSchedules.workingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.onePeriod2222Behind)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.oneWorklog8hourday)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(200, [])
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('2 days, 2 hours, 2 minutes, 2 seconds behind')
    })

    it('will calculate flex when a user started after 1st Jan', async ()=>{
        chrome.storage.sync.get.yields(testFixtures.settings.withStartDate)
        timekeeper.freeze(testFixtures.freezeTimeJan4th)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan4th)
            .reply(200, testFixtures.userSchedules.workingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.onePeriod2DaysBehind)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-04'})
            .reply(200, [])
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-05', to:'2019-01-31'})
            .reply(200, [])
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan4thStartDate)
            .reply(200, testFixtures.userSchedules.Jan1stTo4th)
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('Your timesheet is balanced!')
    })

    it('will fail gracefully when Jira is unreachable through communications failure', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .replyWithError('Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .replyWithError('Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .replyWithError('Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .replyWithError('Nope')
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Jira couldn\'t be contacted')
        }
    })

    it('will fail gracefully when Jira is unreachable through Jira being missing', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(404, 'Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(404, 'Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(404, 'Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(404, 'Nope')
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Jira not found')
        }
    })

    it('will fail gracefully when Tempo Core is reachable but Tempo Timesheets is not', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, testFixtures.userSchedules.workingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(404, 'Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(404, 'Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(404, 'Nope')
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Jira not found')
        }
    })

    it('will fail gracefully when user is not logged into Tempo', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(401, 'Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(401, 'Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(401, 'Nope')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(401, 'Nope')
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Not authorised with Jira')
        }
    })

    it('will fail gracefully when Jira returns an unexpected HTTP response code', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(499, 'Potato')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(499, 'Potato')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(499, 'Potato')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(499, 'Potato')
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual(expect.stringMatching(/^Failed to /))
        }
    })

    it('will fail gracefully when Jira returns an unexpected HTTP response code for Tempo Timesheets, but a good response to Tempo Core', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, testFixtures.userSchedules.workingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(499, 'Potato')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(499, 'Potato')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(499, 'Potato')
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual(expect.stringMatching(/^Failed to /))
        }
    })

    it('will fail gracefully when Jira returns an unexpected HTTP response code for Worklogs, but a good response to everything else', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, testFixtures.userSchedules.workingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.twoPeriodsBalanced)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(499, 'Potato')
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(200, [])
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Failed to fetch previous worklogs from Tempo')
        }
    })

    it('will fail gracefully when Jira returns unexpected body content in Period request', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, testFixtures.userSchedules.workingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.onePeriodUnexpected) //Returns strings rather than numbers
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, [])
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(200, [])
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Unexpected period data returned from Jira')
        }
    })

    it('will fail gracefully when Jira returns unexpected body content in Period request', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, testFixtures.userSchedules.workingDay)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.onePeriodEmpty)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.unexpected.emoji)
        nock(testFixtures.settings.default.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.default.username], from:'2019-01-04', to:'2019-01-31'})
            .reply(200, [])
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Failed to fetch previous worklogs from Tempo')
        }
    })

    it('will fail gracefully when Chrome settings are empty', async ()=>{
        chrome.storage.sync.get.yields(null)
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Check your settings!')
        }
    })

    it('will fail gracefull when Chrome settings are inaccessible', async ()=>{
        chrome.runtime.lastError = 'Potato!'
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Failed to get settings from Chrome Storage')
        }
    })

    it('will set the popup with the appropriate value', ()=>{
        const doc = new DOMParser().parseFromString(testFixtures.pages.popup, 'text/html')
        const flex = 'Some Flex'
        popupUtils.setPopupText(doc, flex)
        expect(doc.getElementById('flextime').innerText).toBe(flex)
    })

    it('will set the popup with the appropriate error message', ()=>{
        const doc = new DOMParser().parseFromString(testFixtures.pages.popup, 'text/html')
        const errorMsg = 'Impossible Flex'
        popupUtils.setPopupText(doc, errorMsg, 'red')
        expect(doc.getElementById('flextime').innerText).toBe(errorMsg)
        expect(doc.getElementById('flextime').style.color).toBe('red')
    })
})