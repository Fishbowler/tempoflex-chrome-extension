const popupUtils = require('../app/scripts/lib/popupUtils')
const chrome = require('sinon-chrome/extensions');
const nock = require('nock')
var timekeeper = require('timekeeper')

timekeeper.freeze(new Date(1546354800000)) //1st Jan 2019, 15:00

const testSettings = {
    jiraBaseUrl: 'https://example.com',
    username: 'a.smith',
    hoursPerDay: 8
}

const testPeriodData = [{workedSeconds: 1001000, requiredSecondsRelativeToday: 1000000},
    {workedSeconds: 1000300, requiredSecondsRelativeToday: 1000000}]
const testTodayWorklogData = [{task: 'a', timeSpentSeconds: 500}, {task: 'b', timeSpentSeconds: 200}]
const testFutureWorklogData = [{task: 'c', timeSpentSeconds: 400}]

describe('getFlex', ()=>{
    beforeAll(()=>{
        global.chrome = chrome;
        chrome.storage.sync.get.yields(testSettings)
        global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    })

    it('will calculate flex', async ()=>{
        nock('https://example.com')
            .get('/rest/tempo-timesheets/4/timesheet-approval/approval-statuses/?userKey=a.smith&numberOfPeriods=1')
            .reply(200, testPeriodData)
        nock('https://example.com')
            .post('/rest/tempo-timesheets/4/worklogs/search', {worker: ['a.smith'], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, testTodayWorklogData)
        nock('https://example.com')
            .post('/rest/tempo-timesheets/4/worklogs/search', {worker: ['a.smith'], from:'2019-01-02', to:'2019-01-31'})
            .reply(200, testFutureWorklogData)
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('15 minutes ahead')
    })
})