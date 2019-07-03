/**
 * @jest-environment node
 */

const tempoUtils = require('../app/scripts/lib/tempoUtils')
const nock = require('nock')

const _Date = Date;
global.Date = jest.fn(() => new _Date(2019,0,1,15,0,0,0));
global.Date.toISOString = _Date.toISOString;
global.Date.now = _Date.now

describe('getTodayString', ()=>{
    it('returns a string representing a date', ()=>{
        const todayString = tempoUtils.getTodayString()
        expect(todayString).toBe('2019-01-01')
    })
})

describe('fetchWorklogDataFromTempo', ()=>{
    const tempoWorklogsUrl = 'https://example.com/worklogs'
    const username = 'tester'

    beforeAll(()=>{
        global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
    })

    nock('https://example.com')
        .post('/worklogs', {worker: [username], from:'2019-01-01', to:'2019-01-01'})
        .reply(200, {didWork: true, hours: 1})

    it('should fetch worklog data from Tempo', async () => {
        const worklogData = await tempoUtils.fetchWorklogDataFromTempo(tempoWorklogsUrl, username)
        return expect(worklogData).toEqual({didWork: true, hours: 1})
    })
})