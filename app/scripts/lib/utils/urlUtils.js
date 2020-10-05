const getPeriodsURL = (settings) => {
    const relativePath = `/rest/tempo-timesheets/4/timesheet-approval/approval-statuses/?userKey=${settings.username}&numberOfPeriods=${settings.periods}`
    return new URL(relativePath, settings.jiraBaseUrl).toString()
}

const getWorklogsURL = (settings) => {
    const relativePath = '/rest/tempo-timesheets/4/worklogs/search'
    return new URL(relativePath, settings.jiraBaseUrl).toString()
}

const getUserScheduleURL = (settings, from, to) => {
    const relativePath = `/rest/tempo-core/1/user/schedule/?user=${settings.username}&from=${from}&to=${to}`
    return new URL(relativePath, settings.jiraBaseUrl).toString()
}

module.exports = {
    getPeriodsURL,
    getWorklogsURL,
    getUserScheduleURL
}