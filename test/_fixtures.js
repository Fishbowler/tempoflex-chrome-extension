module.exports = {
    settings: {
        jiraBaseUrl: 'https://jira.testcorp.net',
        periods: 1,
        username: 'a.smith',
        hoursPerDay: 8,
        useStartDate: false,
        startDate: '01/01/2000'
    },
    periodsUrl: '/rest/tempo-timesheets/4/timesheet-approval/approval-statuses/?userKey=a.smith&numberOfPeriods=1',
    worklogSearchUrl: '/rest/tempo-timesheets/4/worklogs/search',
    userScheduleUrlJan1st: '/rest/tempo-core/1/user/schedule/?user=a.smith&from=2019-01-01&to=2019-01-01',
    userScheduleUrlJan3rd: '/rest/tempo-core/1/user/schedule/?user=a.smith&from=2019-01-03&to=2019-01-03',
    freezeTimeJan1st: new Date(1546354800000), //1st Jan 2019, 15:00
    freezeTimeJan3rd: new Date(1546527600000), //3rd Jan 2019, 15:00
    worklogs: {
        oneWorklog400: [{task: 'c', timeSpentSeconds: 400}],
        twoWorklogs700: [{task: 'a', timeSpentSeconds: 500}, {task: 'b', timeSpentSeconds: 200}],
        oneWorklog8hourday: [{task: 'all-day-slog', timeSpentSeconds: 8*60*60}],
        oneWorklog4hours: [{task: 'all-day-slog', timeSpentSeconds: 4*60*60}]
    },
    periods: {
        twoPeriods1300Ahead: [{workedSeconds: 1001000, requiredSecondsRelativeToday: 1000000},
                            {workedSeconds: 1000300, requiredSecondsRelativeToday: 1000000}],
        twoPeriods500Behind: [{workedSeconds: 999500, requiredSecondsRelativeToday: 1000000},
                                {workedSeconds: 1000000, requiredSecondsRelativeToday: 1000000}],
        twoPeriodsBalanced: [{workedSeconds: 1000, requiredSecondsRelativeToday: 1000},
                            {workedSeconds: 1000, requiredSecondsRelativeToday: 1000}],
        onePeriod1DayAhead: [{workedSeconds: 2*8*60*60, requiredSecondsRelativeToday: 8*60*60}],
        onePeriod2222Behind: [{workedSeconds: (3*8*60*60)-64922, requiredSecondsRelativeToday: 3*8*60*60}],
        onePeriodEmpty: [{workedSeconds: 0, requiredSecondsRelativeToday: 0}],
        onePeriodUnexpected: [{workedSeconds: 'zero', requiredSecondsRelativeToday: 'zero'}]
    },
    userSchedules: {
        workingDay: {"numberOfWorkingDays":1,"requiredSeconds":27000,"days":[{"date":"2019-01-03","requiredSeconds":27000,"type":"WORKING_DAY"}]},
        nonWorkingDay: {"numberOfWorkingDays":0,"requiredSeconds":0,"days":[{"date":"2019-01-01","requiredSeconds":0,"type":"NON_WORKING_DAY"}]}
    },
    unexpected: {
      emoji: '🥔',
      potato: 'potato' //YAGNI?
    },
    pages: {
        options: `<!doctype html>
        <html>
          <head>
            <!-- build:css styles/main.css -->
            <link href="styles/main.css" rel="stylesheet">
            <!-- endbuild -->
          </head>
          <body>
            <div id="jiraURLWrapper">
              <div>Jira root URL: </div>
              <input type="text" id="jiraURL"></input><br><br>
            </div>
        
            <div id="usernameWrapper">
              <div>Jira username: </div>
              <input type="text" id="username"></input><br><br>
            </div>
        
            <div id="hpdWrapper">
              <div>Hours per day: </div>
              <input type="text" id="hoursPerDay"></input><br><br>
            </div>

            <div id="startDateWrapper">
              <div>Specify start date? <br />
                  <span style="font-style: italic;">(This is required if you began employment this calendar year)</span>
              </div>
              <input type="checkbox" id="useStartDate" onchange="showhideStartDate()"><br />
              <div id="startDateShowHideWrapper" style="display:none">
                  <input type="text" id="startDate"></input><br>
              </div>
              <br>
            </div>
        
            <button id="save">Save</button>
            <div id="saved"></div>
        
            <script src="scripts/options.js"></script>
          </body>
        </html>`,
        popup: `<!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <!-- build:css styles/main.css -->
            <link href="styles/main.css" rel="stylesheet">
            <!-- endbuild -->
          </head>
          <body>
            <span id="flextime">Not Fetched Yet</span>
            <script src="scripts/popup.js"></script>
          </body>
        </html>`
    }
}