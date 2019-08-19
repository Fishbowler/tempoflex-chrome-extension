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
        chrome.storage.sync.get.yields(testFixtures.settings)
    })

    it('will calculate positive flex on a non-working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan1st) //1st Jan 2019, 15:00

        nock(testFixtures.settings.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.twoPeriods1300Ahead)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, testFixtures.worklogs.twoWorklogs700)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-02', to:'2019-01-31'})
            .reply(200, testFixtures.worklogs.oneWorklog400)
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('15 minutes ahead')
        //1300 from perdiod + 0 for today (because it's not a working day) - 400 logged in the future = 900 = 15 mins
    })

    it('will calculate negative flex on a non-working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan1st) //1st Jan 2019, 15:00

        nock(testFixtures.settings.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.twoPeriods500Behind)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, testFixtures.worklogs.twoWorklogs700)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-02', to:'2019-01-31'})
            .reply(200, testFixtures.worklogs.oneWorklog400)
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('15 minutes behind')
        //1300 from perdiod + 0 for today (because it's not a working day) - 400 logged in the future = 900 = 15 mins
    })

    it('will calculate flex when balanced at the end of a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.twoPeriodsBalanced)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.oneWorklog8hourday)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-04', to:'2019-02-02'})
            .reply(200, [])
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('Your timesheet is balanced!')
    })

    it('will calculate a 1 day flex on a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.onePeriod1DayAhead)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.oneWorklog8hourday)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-04', to:'2019-02-02'})
            .reply(200, [])
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('1 day ahead')
    })

    it('will calculate flex part way through a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.twoPeriodsBalanced)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.oneWorklog4hours)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-04', to:'2019-02-02'})
            .reply(200, [])
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('4 hours ahead')
    })

    it('will calculate a complex negative flex on a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testFixtures.periods.onePeriod2222Behind)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.oneWorklog8hourday)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-04', to:'2019-02-02'})
            .reply(200, [])
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('2 days, 2 hours, 2 minutes, 2 seconds behind')
    })

    it('will fail gracefully when Jira is unreachable through communications failure', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .replyWithError('Nope')
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-03', to:'2019-01-03'})
            .replyWithError('Nope')
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-04', to:'2019-02-02'})
            .replyWithError('Nope')
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e).toEqual('Failed to get data from Tempo')
        }
    })

    it('will fail gracefully when Jira is unreachable through Jira being missing', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(testFixtures.settings.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(404, 'Nope')
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(404, 'Nope')
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-04', to:'2019-02-02'})
            .reply(404, 'Nope')
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e).toEqual('Failed to get data from Tempo')
        }
    })

    it('will fail gracefull when Chrome settings are empty', async ()=>{
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
})