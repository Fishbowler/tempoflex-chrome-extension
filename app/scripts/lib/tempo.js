const TempoError = require('./utils/errorUtils').TempoError
const dateUtils = require('./utils/dateUtils')
const stringUtils = require('./utils/stringUtils')
const settingsUtils = require('./utils/settingsUtils')
const urlUtils = require('./utils/urlUtils')
const httpUtils = require('./utils/httpUtils')

class Tempo {

    settings = {}

    async init(){
        this.settings = await settingsUtils.getSettings()
        this.generateDateStrings()
        this.generateUrls()
    }

    generateDateStrings() {
        this.todayString = dateUtils.todayString()
        this.tomorrowString = dateUtils.tomorrowString()
        this.lastDayOfPeriodString = dateUtils.lastDayOfThisPeriodString()
        this.jan1stString = dateUtils.jan1stString()
    }

    generateUrls() {
        this.periodsUrl = urlUtils.getPeriodsURL(this.settings)
        this.worklogsUrl = urlUtils.getWorklogsURL(this.settings)
        this.userScheduleUrl = urlUtils.getUserScheduleURL(this.settings, this.todayString, this.todayString)
        if(this.settings.useStartDate){
            this.userSchedulePreStartDateUrl = urlUtils.getUserScheduleURL(this.settings, this.jan1stString, this.settings.startDate)
        }
    }

    async fetchWorklogTotal() {
        const payload = `{"worker":["${this.settings.username}"], "from": "${this.todayString}", "to": "${this.todayString}"}`
        return this._sumWorklogs(await httpUtils.makeRequest(this.worklogsUrl, 'POST', payload, 'Failed to fetch previous worklogs from Tempo'))
    }

    async fetchFutureWorklogTotal() {
        const payload = `{"worker":["${this.settings.username}"], "from": "${this.tomorrowString}", "to": "${this.lastDayOfPeriodString}"}`
        return this._sumWorklogs(await httpUtils.makeRequest(this.worklogsUrl, 'POST', payload, 'Failed to fetch future worklogs from Tempo'))
    }

    async fetchPeriodFlexTotal() {
        const fetchPeriodDataFromTempo = async () => {
            return await httpUtils.makeRequest(this.periodsUrl, 'GET', null, 'Failed to fetch previous periods from Tempo')
        }

        const sumPeriodFlex = (periodData) => {
            const flexAccumulator = (accumulator, currentValue) => {
                return accumulator + currentValue.workedSeconds - currentValue.requiredSecondsRelativeToday
            }
            return periodData.reduce(flexAccumulator, 0)
        }

        const getAdjustmentForToday = async () => {
            let results = await Promise.all([this._isWorkingDayFromUserSchedule(), this.fetchWorklogTotal()])

            const workingDayResult = results[0]
            if(!workingDayResult) return 0 //No adjustment needed - Tempo won't have started you in debt.

            const totalSecondsToday = results[1]
            const workingDayInSeconds = this.settings.hoursPerDay * 60 * 60

            let adjustment = workingDayInSeconds //Credit back tempo's one-day debt at the beginning of the day
            if (totalSecondsToday >= workingDayInSeconds) {
                adjustment -= workingDayInSeconds //If you've worked over a full working day, credit that time back
            } else {
                adjustment -= totalSecondsToday //...else don't include any work done today as additional flex
            }
            return adjustment

        }

        const getAdjustmentForStartDate = async () => {
            if(!this.settings.useStartDate) return Promise.resolve(0)

            let scheduleData = await httpUtils.makeRequest(this.userSchedulePreStartDateUrl, 'GET', null, 'Failed to fetch user schedule prior to start date')
            let scheduledSeconds = scheduleData.requiredSeconds
            scheduledSeconds -= scheduleData.days.pop().requiredSeconds //Don't adjust for the last day, because that was their first day!
            return Promise.resolve(scheduledSeconds)
        }

        let runningFlexTotal = 0

        let results = await Promise.all([
            fetchPeriodDataFromTempo(),
            getAdjustmentForStartDate(),
            getAdjustmentForToday()
        ])

        let periodData, startDateAdjustment, todayAdjustment
        [periodData, startDateAdjustment, todayAdjustment] = results
        
        runningFlexTotal = sumPeriodFlex(periodData)
        if (isNaN(runningFlexTotal)) return Promise.reject(new TempoError('Unexpected period data returned from Jira'))
        runningFlexTotal += startDateAdjustment
        runningFlexTotal += todayAdjustment
        return Promise.resolve(runningFlexTotal)

    }

    _sumWorklogs(worklogs) {
        const workAccumulator = (accumulator, currentValue) => {
            return accumulator + currentValue.timeSpentSeconds
        }
        return worklogs.reduce(workAccumulator, 0)
    }

    async _isWorkingDayFromUserSchedule() {
        let scheduleData = await httpUtils.makeRequest(this.userScheduleUrl, 'GET', null, 'Failed to fetch user schedule for today')
        return Promise.resolve(scheduleData.days[0].type == "WORKING_DAY")
    }

    async getFlexTotal(){
        let flexValues = await Promise.all([
            this.fetchPeriodFlexTotal(),
            this.fetchFutureWorklogTotal()
        ])
        const [periodData, futureAdjustment] = flexValues
        const flex = periodData - futureAdjustment
        return stringUtils.convertFlexToString(flex, this.settings.hoursPerDay)
    }
}

module.exports = Tempo