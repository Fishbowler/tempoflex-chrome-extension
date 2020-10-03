const dateUtils = require('./dateUtils')

module.exports = {
    jiraBaseUrl: 'https://myjira.net',
    periods: (new Date()).getMonth() + 1,
    username: 'jbloggs',
    hoursPerDay: 7.5,
    useStartDate: false,
    startDate: dateUtils.dateToYYYYMMDD(new Date()),
    developerModeEnabled: false,
    developerSettingsVisible: false
}