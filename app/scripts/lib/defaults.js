import * as dateUtils from './dateUtils'

export default {
    jiraBaseUrl: 'https://myjira.net',
    periods: (new Date()).getMonth() + 1,
    username: 'jbloggs',
    hoursPerDay: 7.5,
    useStartDate: false,
    startDate: dateUtils.dateToYYYYMMDD(new Date()),
    developerModeEnabled: false,
    developerSettingsVisible: false
}