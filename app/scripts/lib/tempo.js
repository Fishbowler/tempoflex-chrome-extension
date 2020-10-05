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

    async fetchTodayWorklogTotal() {
        const payload = `{"worker":["${this.settings.username}"], "from": "${this.todayString}", "to": "${this.todayString}"}`
        return this._sumWorklogs(await httpUtils.makeRequest(this.worklogsUrl, 'POST', payload, 'Failed to fetch previous worklogs from Tempo'))
    }

    async fetchFutureWorklogTotal() {
        const payload = `{"worker":["${this.settings.username}"], "from": "${this.tomorrowString}", "to": "${this.lastDayOfPeriodString}"}`
        return this._sumWorklogs(await httpUtils.makeRequest(this.worklogsUrl, 'POST', payload, 'Failed to fetch future worklogs from Tempo'))
    }

    async fetchPeriodFlexData() {
        return this._sumPeriodFlex(await httpUtils.makeRequest(this.periodsUrl, 'GET', null, 'Failed to fetch previous periods from Tempo'))
    }

    async fetchPeriodFlexTotal() {

        const getAdjustmentForTempoStartingTheDayInDebt = async () => {
            let [isWorkingDay, secondsWorkedToday] = await Promise.all([this._isWorkingDayFromUserSchedule(), this.fetchTodayWorklogTotal()])

            if(!isWorkingDay) return 0 //No adjustment needed - Tempo won't have started you in debt.

            const workingDayInSeconds = this.settings.hoursPerDay * 60 * 60

            //Credit back the day tempo said you were behind when you started the day, less any work you did, up to a max of a whole day.
            return Math.max(0, workingDayInSeconds - secondsWorkedToday)

        }

        const getAdjustmentForStartDate = async () => {
            if(!this.settings.useStartDate) return 0
            let scheduleData = await httpUtils.makeRequest(this.userSchedulePreStartDateUrl, 'GET', null, 'Failed to fetch user schedule prior to start date')
            return scheduleData.requiredSeconds - scheduleData.days.pop().requiredSeconds //Don't adjust for the last day, because that was their first day!
        }

        let runningFlexTotal = 0

        let [periodData, 
            startDateAdjustment, 
            todayAdjustment
        ] = await Promise.all([
            this.fetchPeriodFlexData(),
            getAdjustmentForStartDate(),
            getAdjustmentForTempoStartingTheDayInDebt()
        ])
        
        runningFlexTotal = periodData
        if (isNaN(runningFlexTotal)) return Promise.reject(new TempoError('Unexpected period data returned from Jira'))
        runningFlexTotal += startDateAdjustment
        runningFlexTotal += todayAdjustment
        return runningFlexTotal
    }

    _sumWorklogs(worklogs) {
        const workAccumulator = (accumulator, currentValue) => {
            return accumulator + currentValue.timeSpentSeconds
        }
        return worklogs.reduce(workAccumulator, 0)
    }

    _sumPeriodFlex(periodData) {
        const flexAccumulator = (accumulator, currentValue) => {
            return accumulator + currentValue.workedSeconds - currentValue.requiredSecondsRelativeToday
        }
        return periodData.reduce(flexAccumulator, 0)
    }

    async _isWorkingDayFromUserSchedule() {
        let scheduleData = await httpUtils.makeRequest(this.userScheduleUrl, 'GET', null, 'Failed to fetch user schedule for today')
        return Promise.resolve(scheduleData.days[0].type == "WORKING_DAY")
    }

    async getFlexTotal() {
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