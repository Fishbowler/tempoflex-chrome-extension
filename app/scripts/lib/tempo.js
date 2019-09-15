const TempoError = require('./errorUtils').TempoError

class Tempo {
    constructor(settings) {
        this.settings = settings
        this.generateDateStrings()
        this.generateUrls()
    }

    generateDateStrings() {
        const formatDateStringForTempo = (dateToFormat) => {
            return dateToFormat.toISOString().substring(0, 10)
        }
        this.todayString = formatDateStringForTempo(new Date())

        let tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        this.tomorrowString = formatDateStringForTempo(tomorrow)

        let thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        this.thirtyDaysFromNowString = formatDateStringForTempo(thirtyDaysFromNow)
    }

    generateUrls() {
        this._generatePeriodsURL()
        this._generateWorklogsURL()
        this._generateUserScheduleURL(this.todayString, this.todayString)
    }

    fetchWorklogTotal() {
        const payload = `{"worker":["${this.settings.username}"], "from": "${this.todayString}", "to": "${this.todayString}"}`
        return this._makeRequest('POST', this.worklogsUrl, payload)
            .then((worklogs) => {
                return Promise.resolve(this._sumWorklogs(worklogs))
            })
            .catch(err => {
                let thisErr = err instanceof TempoError ? err : new TempoError('Failed to fetch previous worklogs from Tempo')
                return Promise.reject(thisErr)
            })
    }

    fetchFutureWorklogTotal() {
        const payload = `{"worker":["${this.settings.username}"], "from": "${this.tomorrowString}", "to": "${this.thirtyDaysFromNowString}"}`
        return this._makeRequest('POST', this.worklogsUrl, payload)
            .then((worklogs) => {
                return Promise.resolve(this._sumWorklogs(worklogs))
            })
            .catch(err => {
                let thisErr = err instanceof TempoError ? err : new TempoError('Failed to fetch future worklogs from Tempo')
                return Promise.reject(thisErr)
            })
    }

    fetchPeriodFlexTotal() {
        const fetchPeriodDataFromTempo = () => {
            return this._makeRequest('GET', this.periodsUrl)
                .catch(err => {
                    let thisErr = err instanceof TempoError ? err : new TempoError('Failed to fetch previous periods from Tempo')
                    return Promise.reject(thisErr)
                });
        }

        const sumPeriodFlex = (periodData) => {
            const flexAccumulator = (accumulator, currentValue) => {
                return accumulator + currentValue.workedSeconds - currentValue.requiredSecondsRelativeToday
            }
            return periodData.reduce(flexAccumulator, 0)
        }

        return this._getWorkingDayFromUserSchedule()
            .then(workingDay => {
                this.workingDay = workingDay
                return fetchPeriodDataFromTempo()
            })
            .then(periodData => {
                let startingTotal = sumPeriodFlex(periodData)
                if (isNaN(startingTotal)) return Promise.reject(new TempoError('Unexpected period data returned from Jira'))
                if (!this.workingDay) return Promise.resolve(startingTotal)

                const workingDayInSeconds = this.settings.hoursPerDay * 60 * 60
                return this.fetchWorklogTotal()
                    .then(totalSecondsToday => {
                        let fudge = workingDayInSeconds //Credit back tempo's one-day debt at the beginning of the day
                        if (totalSecondsToday >= workingDayInSeconds) {
                            fudge -= workingDayInSeconds //If you've worked over a full working day, credit that time back
                        } else {
                            fudge -= totalSecondsToday //...else don't include any work done today as additional flex
                        }
                        return Promise.resolve(startingTotal + fudge)
                    })
            })
    }

    _sumWorklogs(worklogs) {
        const workAccumulator = (accumulator, currentValue) => {
            return accumulator + currentValue.timeSpentSeconds
        }
        return worklogs.reduce(workAccumulator, 0)
    }

    _generatePeriodsURL() {
        const relativePath = `/rest/tempo-timesheets/4/timesheet-approval/approval-statuses/?userKey=${this.settings.username}&numberOfPeriods=${this.settings.periods}`
        this.periodsUrl = new URL(relativePath, this.settings.jiraBaseUrl).toString()
    }

    _generateWorklogsURL() {
        const relativePath = '/rest/tempo-timesheets/4/worklogs/search'
        this.worklogsUrl = new URL(relativePath, this.settings.jiraBaseUrl).toString()
    }

    _generateUserScheduleURL(from, to) {
        const relativePath = `/rest/tempo-core/1/user/schedule/?user=${this.settings.username}&from=${from}&to=${to}`
        this.userScheduleUrl = new URL(relativePath, this.settings.jiraBaseUrl).toString()
    }

    _getWorkingDayFromUserSchedule() {
        return this._makeRequest('GET', this.userScheduleUrl)
            .then(scheduleData => {
                return Promise.resolve(scheduleData.days[0].type == "WORKING_DAY")
            })
            .catch(err => {
                let thisErr = err instanceof TempoError ? err : new TempoError('Failed to fetch user schedule from Tempo')
                return Promise.reject(thisErr)
            })
    }

    _makeRequest(method, url, body) {
        return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest()
                xhr.open(method, url)
                xhr.setRequestHeader('Content-Type', 'application/json')
                xhr.onload = function () {
                    if (this.status >= 200 && this.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText))
                        } catch(e) {
                            reject('Unexpected content from Tempo')
                        }
                        
                    } else {
                        reject({
                            status: this.status,
                            statusText: xhr.statusText
                        })
                    }
                }
                xhr.onerror = function () {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    })
                }
                /* istanbul ignore next */ //Testing HTTP timeouts is too hard.
                xhr.timeout = 10000
                /* istanbul ignore next */
                xhr.ontimeout = function () {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    })
                }
                if (body) {
                    xhr.send(body)
                } else {
                    xhr.send()
                }
            })
            .catch(e => {
                switch (e.status) {
                    case 401:
                    case 403:
                        throw new TempoError('Not authorised with Jira')
                    case 404:
                        throw new TempoError('Jira not found')
                    case 0:
                        throw new TempoError('Jira couldn\'t be contacted')
                    default:
                        throw e
                }
            })
    }
}

module.exports = Tempo