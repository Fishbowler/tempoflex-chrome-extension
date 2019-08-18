const popupUtils = require('../app/scripts/lib/popupUtils')
const chrome = require('sinon-chrome/extensions');
const nock = require('nock')
const testFixtures = require('./_fixtures')
const timekeeper = require('timekeeper')

describe('getFlex', ()=>{
    beforeAll(()=>{
        global.chrome = chrome;
        chrome.storage.sync.get.yields(testFixtures.settings)
        global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    })

    afterEach(()=>{
        timekeeper.reset()
    })

    it('will calculate flex on a non-working day', async ()=>{
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

    it('will fail gracefully when Jira is unreachable', async ()=>{
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
})