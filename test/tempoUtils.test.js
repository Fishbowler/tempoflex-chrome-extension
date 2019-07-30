/**
 * @jest-environment node
 */

const tempoUtils = require('../app/scripts/lib/tempoUtils')
const nock = require('nock')
var timekeeper = require('timekeeper')

timekeeper.freeze(new Date(1546354800000)) //1st Jan 2019, 15:00

describe('getTodayString', ()=>{
    it('returns a string representing a date', ()=>{
        const todayString = tempoUtils.getTodayString()
        expect(todayString).toBe('2019-01-01')
    })
})

describe('getTomorrowString', ()=>{
    it('returns a string representing a date', ()=>{
        const tomorrowString = tempoUtils.getTomorrowString()
        expect(tomorrowString).toBe('2019-01-02')
    })
})

describe('getLastDayOfPeriodString', ()=>{
    it('returns a string representing a date', ()=>{
        const lastDayOfThisPeriodString = tempoUtils.getLastDayOfPeriodString()
        expect(lastDayOfThisPeriodString).toBe('2019-01-31')
    })
})

describe('fetchWorklogDataFromTempo', ()=>{
    const tempoWorklogsUrl = 'https://example.com/worklogs'
    const username = 'tester'
    const worklogs = [{task: 'a', timeSpentSeconds: 100}, {task: 'b', timeSpentSeconds: 200}]

    beforeAll(()=>{
        global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    })

    it('should fetch worklog data from Tempo', async () => {
        nock('https://example.com')
            .post('/worklogs', {worker: [username], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, worklogs)
        const worklogData = await tempoUtils.fetchWorklogDataFromTempo(tempoWorklogsUrl, username)
        return expect(worklogData).toEqual(worklogs)
    })

    it('should error sensibly when it cannot reach Tempo', async () => {
        nock('https://example.com')
            .post('/worklogs', {worker: [username], from:'2019-01-01', to:'2019-01-01'})
            .reply(500, 'Internal Server Error')
        
        expect.assertions(1)
        try {
            await tempoUtils.fetchWorklogDataFromTempo(tempoWorklogsUrl, username)
        } catch (e){
            expect(e).toBe('Failed to fetch previous worklogs from Tempo')
        }
    })
})

describe('fetchWorklogTotalFromTempo', ()=>{
    const tempoWorklogsUrl = 'https://example.com/worklogs'
    const username = 'tester'
    const worklogs = [{task: 'a', timeSpentSeconds: 100}, {task: 'b', timeSpentSeconds: 200}]

    beforeAll(()=>{
        global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    })

    it('should fetch worklog data from Tempo', async () => {
        nock('https://example.com')
            .post('/worklogs', {worker: [username], from:'2019-01-01', to:'2019-01-01'})
            .reply(200, worklogs)
        const worklogTotal = await tempoUtils.fetchWorklogTotalFromTempo(tempoWorklogsUrl, username)
        return expect(worklogTotal).toEqual(300)
    })
})

describe('fetchFutureWorklogDataFromTempo', ()=>{
    const tempoWorklogsUrl = 'https://example.com/worklogs'
    const username = 'tester'
    const worklogs = [{task: 'a', timeSpentSeconds: 100}, {task: 'b', timeSpentSeconds: 200}]

    beforeAll(()=>{
        global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    })

    it('should fetch worklog data from Tempo', async () => {
        nock('https://example.com')
            .post('/worklogs', {worker: [username], from:'2019-01-02', to:'2019-01-31'})
            .reply(200, worklogs)
        const worklogData = await tempoUtils.fetchFutureWorklogDataFromTempo(tempoWorklogsUrl, username)
        return expect(worklogData).toEqual(worklogs)
    })

    it('should error sensibly when it cannot reach Tempo', async () => {
        nock('https://example.com')
            .post('/worklogs', {worker: [username], from:'2019-01-02', to:'2019-01-31'})
            .reply(500, 'Internal Server Error')
        
        expect.assertions(1)
        try {
            await tempoUtils.fetchFutureWorklogDataFromTempo(tempoWorklogsUrl, username)
        } catch (e){
            expect(e).toBe('Failed to fetch future worklogs from Tempo')
        }
    })
})

describe('fetchFutureWorklogTotalFromTempo', ()=>{
    const tempoWorklogsUrl = 'https://example.com/worklogs'
    const username = 'tester'
    const someWorklogs = [{task: 'a', timeSpentSeconds: 100}, {task: 'b', timeSpentSeconds: 200}]

    beforeAll(()=>{
        global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    })

    it('should fetch worklog data from Tempo', async () => {
        nock('https://example.com')
            .post('/worklogs', {worker: [username], from:'2019-01-02', to:'2019-01-31'})
            .reply(200, someWorklogs)
        const worklogTotal = await tempoUtils.fetchFutureWorklogTotalFromTempo(tempoWorklogsUrl, username)
        return expect(worklogTotal).toEqual(300)
    })

    it('should cope with receiving Tempo having no worklogs', async () => {
        nock('https://example.com')
            .post('/worklogs', {worker: [username], from:'2019-01-02', to:'2019-01-31'})
            .reply(200, [])
        const worklogTotal = await tempoUtils.fetchFutureWorklogTotalFromTempo(tempoWorklogsUrl, username)
        return expect(worklogTotal).toEqual(0)
    })
})

describe('fetchPeriodDataFromTempo', ()=>{
    const tempoPeriodsUrl = 'https://example.com/periods'

    beforeAll(()=>{
        global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
    })

    it('should fetch worklog data from Tempo', async () => {
        nock('https://example.com')
            .get('/periods')
            .reply(200, {didWork: true, hours: 1})
        const worklogData = await tempoUtils.fetchPeriodDataFromTempo(tempoPeriodsUrl)
        return expect(worklogData).toEqual({didWork: true, hours: 1})
    })

    it('should error sensibly when it cannot reach Tempo', async () => {
        nock('https://example.com')
            .get('/periods')
            .reply(500, 'Internal Server Error')
        
        expect.assertions(1)
        try {
            await tempoUtils.fetchPeriodDataFromTempo(tempoPeriodsUrl)
        } catch (e){
            expect(e).toBe('Failed to fetch previous periods from Tempo')
        }
    })
})