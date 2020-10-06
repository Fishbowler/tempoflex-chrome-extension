const popupUtils = require('../app/scripts/lib/popupHelper')
const browser = require('sinon-chrome/extensions');
const nock = require('nock')
const testFixtures = require('./_fixtures')
const timekeeper = require('timekeeper')

const fs = require('fs')
const popupPage = fs.readFileSync('./app/popup.html', {encoding:'utf8'})

describe('getFlex', ()=>{
    const defaultSettings = testFixtures.settings.builder().build()
    const workingDay = testFixtures.userSchedules.builder()
                            .withDays(1)
                            .withStartDate("2019-01-03")
                            .withSecondsPerDay(8*60*60)
                            .build()
    const nonWorkingDay = testFixtures.userSchedules.builder()
                            .withDays(1)
                            .withStartDate("2019-01-01")
                            .withSecondsPerDay(8*60*60)
                            .build()

    beforeAll(()=>{
        global.browser = browser;
        global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    })

    beforeEach(()=>{
        browser.storage.sync.get.reset()
        browser.storage.sync.get.yields(defaultSettings)
        browser.runtime.lastError = null
        nock.cleanAll()
    })

    it('will calculate positive flex on a non-working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan1st) //1st Jan 2019, 15:00
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan1st)
            .reply(200, nonWorkingDay)
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, testFixtures.worklogs.builder().withTasks(2).withTime(900).build())
            .persist()
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('15 minutes ahead')
    })

    it('will calculate flex when balanced at the end of a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-03','2019-01-03'))
            .reply(200, workingDay)
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-03'))
            .reply(200, testFixtures.userSchedules.builder()
                .withDays(3)
                .withStartDate("2019-01-01")
                .withSecondsPerDay(8*60*60)
                .build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.builder().withTasks(3).withTime(2*8*60*60).build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.builder().withTasks(1).withTime(8*60*60).build())
            .persist()
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('Your timesheet is balanced!')
    })

    it('will calculate flex when balanced at the beginning of the first day (no work done)', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan1st)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan1st)
            .reply(200, nonWorkingDay)
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, [])
            .persist()
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('Your timesheet is balanced!')
    })

    it('will calculate a 1 day flex on a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-03','2019-01-03'))
            .reply(200, workingDay)
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-03'))
            .reply(200, testFixtures.userSchedules.builder()
                .withDays(3)
                .withStartDate("2019-01-01")
                .withSecondsPerDay(8*60*60)
                .build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.builder().withTasks(20).withTime(3*8*60*60).build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, testFixtures.worklogs.builder().withTasks(6).withTime(8*60*60).build())
            .persist()
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('1 day ahead')
    })

    it('will calculate a complex negative flex on a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan4th)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-04','2019-01-04'))
            .reply(200, workingDay)
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-04'))
            .reply(200, testFixtures.userSchedules.builder()
                .withDays(4)
                .withStartDate("2019-01-01")
                .withSecondsPerDay(8*60*60)
                .build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-04'})
            .reply(200, testFixtures.worklogs.builder().withTasks(0).build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-04', to:'2019-01-04'})
            .reply(200, testFixtures.worklogs.builder().withTasks(0).build())
            .persist()
        
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('2 days behind')
    })

    
    it('will calculate a complex negative flex on a working day', async ()=>{
        timekeeper.freeze(testFixtures.freezeTimeJan4th)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-04','2019-01-04'))
            .reply(200, workingDay)
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-04'))
            .reply(200, testFixtures.userSchedules.builder()
                .withDays(4)
                .withStartDate("2019-01-01")
                .withSecondsPerDay(8*60*60)
                .build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-04'})
            .reply(200, testFixtures.worklogs.builder().withTasks(20).withTime(26139).build()) //2 working days not including today. Minus 1 day, 1 hour, 1 minute, 1 second. Plus the 1000 seconds worked today
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-04', to:'2019-01-04'})
            .reply(200, testFixtures.worklogs.builder().withTasks(4).withTime(1000).build())
            .persist()
        
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('1 day, 1 hour, 1 minute, 1 second behind')
    })

    it('will calculate flex when a user started after 1st Jan', async ()=>{
        browser.storage.sync.get.yields(testFixtures.settings.builder()
                                            .withProperty('useStartDate', true)
                                            .withProperty('startDate', '2019-01-04')
                                            .build())
        timekeeper.freeze(testFixtures.freezeTimeJan4th)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan4th)
            .reply(200, workingDay)
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-04', to:'2019-01-04'})
            .reply(200, [])
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan4thStartDate)
            .reply(200, testFixtures.userSchedules.builder()
                .withDays(4)
                .withStartDate("2019-01-01")
                .withSecondsPerDay(8*60*60)
                .build())
        const flex = await popupUtils.getFlex()
        return expect(flex).toEqual('Your timesheet is balanced!')
    })

    it('will fail gracefully when Jira is unreachable through communications failure', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-03','2019-01-03'))
            .replyWithError('Nope')
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-03'))
            .replyWithError('Nope')
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-03', to:'2019-01-03'})
            .replyWithError('Nope')
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-03'})
            .replyWithError('Nope')
            .persist()
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Jira couldn\'t be contacted')
        }
    })

    it('will fail gracefully when Jira is unreachable through Jira being missing', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-03','2019-01-03'))
            .reply(404, 'Nope')
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-03'))
            .reply(404, 'Nope')
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(404, 'Nope')
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-03'})
            .reply(404, 'Nope')
            .persist()
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Jira not found')
        }
    })

    it('will fail gracefully when Tempo Core is reachable but Tempo Timesheets is not', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-03','2019-01-03'))
            .reply(200, workingDay)
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-03'))
            .reply(200, testFixtures.userSchedules.builder()
                .withDays(3)
                .withStartDate("2019-01-01")
                .withSecondsPerDay(8*60*60)
                .build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(404, 'Nope')
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-03'})
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
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-03','2019-01-03'))
            .reply(401, 'Nope')
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-03'))
            .reply(401, 'Nope')
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(401, 'Nope')
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-03'})
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
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-03','2019-01-03'))
            .reply(499, 'Potato')
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-03'))
            .reply(499, 'Potato')
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(499, 'Potato')
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-03'})
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
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, workingDay)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-03'))
            .reply(200, testFixtures.userSchedules.builder()
                .withDays(3)
                .withStartDate("2019-01-01")
                .withSecondsPerDay(8*60*60)
                .build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(499, 'Potato')
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-03'})
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
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, workingDay)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-03'))
            .reply(200, testFixtures.userSchedules.builder()
                .withDays(3)
                .withStartDate("2019-01-01")
                .withSecondsPerDay(8*60*60)
                .build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(499, 'Potato')
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-03'})
            .reply(200, [])
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Failed to fetch today\'s worklogs from Tempo')
        }
    })

    it('will fail gracefully when Jira returns unexpected body content in Worklog request', async ()=>{
        expect.assertions(1)
        timekeeper.freeze(testFixtures.freezeTimeJan3rd)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrlJan3rd)
            .reply(200, workingDay)
        nock(defaultSettings.jiraBaseUrl)
            .get(testFixtures.userScheduleUrl('2019-01-01','2019-01-03'))
            .reply(200, testFixtures.userSchedules.builder()
                .withDays(3)
                .withStartDate("2019-01-01")
                .withSecondsPerDay(8*60*60)
                .build())
            .persist()
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-03', to:'2019-01-03'})
            .reply(200, "🥔")
        nock(defaultSettings.jiraBaseUrl)
            .post(testFixtures.worklogSearchUrl, {worker: [defaultSettings.username], from:'2019-01-01', to:'2019-01-03'})
            .reply(200, [])
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Failed to fetch today\'s worklogs from Tempo')
        }
    })

    it('will fail gracefully when Chrome settings are empty', async ()=>{
        browser.storage.sync.get.yields(null)
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Check your settings!')
        }
    })

    it('will fail gracefull when Chrome settings are inaccessible', async ()=>{
        browser.runtime.lastError = 'Potato!'
        try {
            const flex = await popupUtils.getFlex()
        } catch(e){
            return expect(e.message).toEqual('Failed to get settings from Chrome Storage')
        }
    })

    it('will set the popup with the appropriate value', ()=>{
        const doc = new DOMParser().parseFromString(popupPage, 'text/html')
        const flex = 'Some Flex'
        popupUtils.setPopupText(doc, flex)
        expect(doc.getElementById('flextime').innerText).toBe(flex)
    })

    it('will set the popup with the appropriate error message', ()=>{
        const doc = new DOMParser().parseFromString(popupPage, 'text/html')
        const errorMsg = 'Impossible Flex'
        popupUtils.setPopupText(doc, errorMsg, 'red')
        expect(doc.getElementById('flextime').innerText).toBe(errorMsg)
        expect(doc.getElementById('flextime').style.color).toBe('red')
    })
})