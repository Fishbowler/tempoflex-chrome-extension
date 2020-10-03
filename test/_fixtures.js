module.exports = {
    settings: {
      builder: function(){
        let defaults = {
          jiraBaseUrl: 'https://jira.testcorp.net',
          periods: 1,
          username: 'a.smith',
          hoursPerDay: 8,
          useStartDate: false,
          startDate: '2000-01-01',
          developerModeEnabled: false,
          developerSettingsVisible: false
        }

        return {
          withProperty(propName, value){
            if(defaults.hasOwnProperty(propName)){ //In case we have tests augmenting defaults, hiding pesky bugs
              defaults[propName] = value
            }
            return this
          },
          build(){
            return defaults
          }
        }
      }
    },
    periodsUrl: '/rest/tempo-timesheets/4/timesheet-approval/approval-statuses/?userKey=a.smith&numberOfPeriods=1',
    worklogSearchUrl: '/rest/tempo-timesheets/4/worklogs/search',
    userScheduleUrlJan1st: '/rest/tempo-core/1/user/schedule/?user=a.smith&from=2019-01-01&to=2019-01-01',
    userScheduleUrlJan3rd: '/rest/tempo-core/1/user/schedule/?user=a.smith&from=2019-01-03&to=2019-01-03',
    userScheduleUrlJan4th: '/rest/tempo-core/1/user/schedule/?user=a.smith&from=2019-01-04&to=2019-01-04',
    userScheduleUrlJan4thStartDate: '/rest/tempo-core/1/user/schedule/?user=a.smith&from=2019-01-01&to=2019-01-04',
    freezeTimeJan1st: new Date(1546354800000), //1st Jan 2019, 15:00
    freezeTimeJan3rd: new Date(1546527600000), //3rd Jan 2019, 15:00
    freezeTimeJan4th: new Date(1546614000000), //4th Jan 2019, 15:00
    worklogs: {
      builder: function(){
        let tasks = 1;
        let time = 0;
        return {
          withTasks(numTasks){
            tasks = numTasks
            return this
          },
          withTime(seconds){
            time = seconds
            return this
          },
          build: function(){
            let worklogArray = []
            let remainingTime = time
            for(let i = 1; i <= tasks; i++){
              let thisTask = {}
              thisTask.task = `task${i}`
              if(i == tasks){
                thisTask.timeSpentSeconds = remainingTime
              } else {
                thisTask.timeSpentSeconds = Math.floor(time/tasks)
                remainingTime -= Math.floor(time/tasks)
              }
              worklogArray.push(thisTask)
            }
            return worklogArray
          }
        }
      }
    },
    periods: { //TODO: Make a builder for this
        onePeriodUnexpected: [{workedSeconds: 'zero', requiredSecondsRelativeToday: 'zero'}],
        builder: function(){
          let numberOfPeriods = 0
          let delta = 0
          let empty = false
          return {
            withPeriods: function(periods){
              numberOfPeriods = periods
              return this
            },
            withDelta: function(thisDelta){
              delta = thisDelta
              return this
            },
            empty: function(shouldBeEmpty = true){
              empty = shouldBeEmpty
              return this
            },
            build: function(){
              let periodData = []
              const defaultWorked = defaultRequired = 8*60*60

              const buildPeriod = function(worked, required){
                if(empty){
                  return {workedSeconds: 0, requiredSecondsRelativeToday: 0}
                }
                return {workedSeconds: worked, requiredSecondsRelativeToday: required}
              }
              
              if(delta < 0 && (-1 * delta) > defaultWorked){ //If the delta is behind, and by more than a day
                periodData.push(buildPeriod(0, delta * -1)) //Make a period behind by the size of one delta
              } else {
                periodData.push(buildPeriod(defaultWorked + delta, defaultRequired)) //Make a period above or behind by the delta
              }
              
              if(numberOfPeriods > 1){
                for(let period = 2; period <= numberOfPeriods; period++){
                  periodData.push(buildPeriod(defaultWorked, defaultRequired))
                }
              }

              return periodData
            }
          }
        }
    },
    userSchedules: { //TODO: Make a builder for this?
        workingDay: {"numberOfWorkingDays":1,"requiredSeconds":27000,"days":[{"date":"2019-01-03","requiredSeconds":27000,"type":"WORKING_DAY"}]},
        nonWorkingDay: {"numberOfWorkingDays":0,"requiredSeconds":0,"days":[{"date":"2019-01-01","requiredSeconds":0,"type":"NON_WORKING_DAY"}]},
        Jan1stTo4th: {"numberOfWorkingDays":2,"requiredSeconds":2*8*60*60,"days":[{"date":"2019-01-01","requiredSeconds":0,"type":"NON_WORKING_DAY"},{"date":"2019-01-02","requiredSeconds":0,"type":"NON_WORKING_DAY"},{"date":"2019-01-03","requiredSeconds":8*60*60,"type":"WORKING_DAY"},{"date":"2019-01-04","requiredSeconds":8*60*60,"type":"WORKING_DAY"}]},
        build: function(secondsPerDay, startDate, endDate){
          //args aren't right...
        }
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
              <input type="checkbox" id="useStartDate"><br />
              <div id="startDateShowHideWrapper" style="display:none">
                  <input type="date" id="startDate"></input><br>
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