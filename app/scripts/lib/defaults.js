const dateUtils = require('./utils/dateUtils')

module.exports = {
    jiraBaseUrl: 'https://myjira.net',
    username: 'jbloggs',
    hoursPerDay: 7.5,
    useStartDate: false,
    startDate: dateUtils.dateToYYYYMMDD(new Date()),
    developerModeEnabled: false,
    developerSettingsVisible: false
}