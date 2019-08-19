module.exports = {
    settings: {
        jiraBaseUrl: 'https://jira.testcorp.net',
        periods: 1,
        username: 'a.smith',
        hoursPerDay: 8
    },
    periodsUrl: '/rest/tempo-timesheets/4/timesheet-approval/approval-statuses/?userKey=a.smith&numberOfPeriods=1',
    worklogSearchUrl: '/rest/tempo-timesheets/4/worklogs/search',
    freezeTimeJan1st: new Date(1546354800000), //1st Jan 2019, 15:00
    freezeTimeJan3rd: new Date(1546527600000), //3rd Jan 2019, 15:00
    worklogs: {
        oneWorklog400: [{task: 'c', timeSpentSeconds: 400}],
        twoWorklogs700: [{task: 'a', timeSpentSeconds: 500}, {task: 'b', timeSpentSeconds: 200}],
        oneWorklog8hourday: [{task: 'all-day-slog', timeSpentSeconds: 8*60*60}]
    },
    periods: {
        twoPeriods1300Ahead: [{workedSeconds: 1001000, requiredSecondsRelativeToday: 1000000},
                            {workedSeconds: 1000300, requiredSecondsRelativeToday: 1000000}],
        twoPeriodsBalanced: [{workedSeconds: 1000, requiredSecondsRelativeToday: 1000},
                            {workedSeconds: 1000, requiredSecondsRelativeToday: 1000}]
    }
}