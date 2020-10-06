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
        this.jan1stString = dateUtils.jan1stString()
    }

    generateUrls() {
        this.periodsUrl = urlUtils.getPeriodsURL(this.settings)
        this.worklogsUrl = urlUtils.getWorklogsURL(this.settings)
        this.userScheduleTodayUrl = urlUtils.getUserScheduleURL(this.settings, this.todayString, this.todayString)
        this.userScheduleFullUrl = urlUtils.getUserScheduleURL(
            this.settings, 
            (this.settings.useStartDate ? this.settings.startDate : this.jan1stString), 
            this.todayString
        )
    }

    async fetchTodayWorklogTotal() {
        const payload = `{"worker":["${this.settings.username}"], "from": "${this.todayString}", "to": "${this.todayString}"}`
        return this._sumWorklogs(await httpUtils.makeRequest(this.worklogsUrl, 'POST', payload, 'Failed to fetch today\'s worklogs from Tempo'))
    }

    async fetchWorklogTotal() {
        const day1 = this.settings.useStartDate ? this.settings.startDate : this.jan1stString
        const payload = `{"worker":["${this.settings.username}"], "from": "${day1}", "to": "${this.todayString}"}`
        return this._sumWorklogs(await httpUtils.makeRequest(this.worklogsUrl, 'POST', payload, 'Failed to fetch previous worklogs from Tempo'))
    }

    async fetchScheduleTotal() {
        return (await httpUtils.makeRequest(this.userScheduleFullUrl, 'GET', null, 'Failed to fetch full user schedule')).requiredSeconds
    }

    async fetchFlexTotalFromSchedulesAndWorklogs() {
        
        const getAdjustmentForTempoStartingTheDayInDebt = async () => {
            let [isWorkingDay, secondsWorkedToday] = await Promise.all([this._isWorkingDayFromUserSchedule(), this.fetchTodayWorklogTotal()])
            if(!isWorkingDay) return 0 //No adjustment needed - Tempo won't have started you in debt.

            const workingDayInSeconds = this.settings.hoursPerDay * 60 * 60
            //Credit back the day tempo said you were behind when you started the day, less any work you did, up to a max of a whole day.
            return Math.max(0, workingDayInSeconds - secondsWorkedToday)
        }
        
        let [scheduleTotal, 
            worklogTotal, 
            todayAdjustment
        ] = await Promise.all([
            this.fetchScheduleTotal(),
            this.fetchWorklogTotal(),
            getAdjustmentForTempoStartingTheDayInDebt()
        ])

        return worklogTotal - scheduleTotal + todayAdjustment
    }

    _sumWorklogs(worklogs) {
        const workAccumulator = (accumulator, currentValue) => {
            return accumulator + currentValue.timeSpentSeconds
        }
        return worklogs.reduce(workAccumulator, 0)
    }

    async _isWorkingDayFromUserSchedule() {
        let scheduleData = await httpUtils.makeRequest(this.userScheduleTodayUrl, 'GET', null, 'Failed to fetch user schedule for today')
        return scheduleData.days[0].type == "WORKING_DAY"
    }

    async getFlexTotal() {
        const flex = await this.fetchFlexTotalFromSchedulesAndWorklogs()
        return stringUtils.convertFlexToString(flex, this.settings.hoursPerDay)
    }
}

module.exports = Tempo