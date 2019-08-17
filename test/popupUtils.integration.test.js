const popupUtils = require('../app/scripts/lib/popupUtils')
const chrome = require('sinon-chrome/extensions');
const nock = require('nock')
const testFixtures = require('./_fixtures')
const timekeeper = require('timekeeper')

timekeeper.freeze(testFixtures.freezeTimeJan1st) //1st Jan 2019, 15:00

//Data that will "come from Tempo"
const testPeriodData = testFixtures.periods.twoPeriods1300Ahead
const testTodayWorklogData = testFixtures.worklogs.twoWorklogs700 //Jan 1st not a working day, so no adjustment to make
const testFutureWorklogData = testFixtures.worklogs.oneWorklog400 //400 from Periods was future time, so will be deducted
//1300 + 0 - 400 = 900 = 15 mins

describe('getFlex', ()=>{
    beforeAll(()=>{
        global.chrome = chrome;
        chrome.storage.sync.get.yields(testFixtures.settings)
        global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    })

    it('will calculate flex', async ()=>{
        nock(testFixtures.settings.jiraBaseUrl)
            .get(testFixtures.periodsUrl)
            .reply(200, testPeriodData)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, testTodayWorklogData)
        nock(testFixtures.settings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [testFixtures.settings.username], from:'2019-01-02', to:'2019-01-31'})
            .reply(200, testFutureWorklogData)
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('15 minutes ahead')
    })
})