module.exports = {
    jiraBaseUrl: 'https://myjira.net',
    periods: (new Date()).getMonth() + 1,
    username: 'jbloggs',
    hoursPerDay: 7.5,
    useStartDate: false,
    startDate: new Date().toISOString().substring(0, 10)
}