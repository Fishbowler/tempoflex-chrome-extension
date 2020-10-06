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
    userSchedules: {
        builder: function(){
          const nonWorkingDays = [
            "2019-01-01",
            "2019-01-05",
            "2019-01-06"
          ]
          const workingDays = [
            "2019-01-02",
            "2019-01-03",
            "2019-01-04",
            "2019-01-07",
            "2019-01-08"
          ]

          const allDays = workingDays.concat(nonWorkingDays).sort()

          let startDate = "2019-01-01"
          let secondsPerDay = 0
          let numDays = 1

          return {
            withStartDate: function(date){
              startDate = date
              return this
            },
            withSecondsPerDay: function(seconds){
              secondsPerDay = seconds
              return this
            },
            withDays: function(days){
              numDays = days
              return this
            },
            build: function(){
              let returnValue = {
                "numberOfWorkingDays": 0,
                "requiredSeconds": 0,
                "days": []
              }

              const firstDayIndex = allDays.indexOf(startDate)
              let secondsTotal = 0
              let workingDaysTotal = 0

              for(i = 0; i < numDays; i++){
                const thisDate = allDays[firstDayIndex + i]
                
                let thisDayObject = {
                  "date":thisDate,
                  "requiredSeconds": secondsPerDay
                }
                
                if(workingDays.includes(thisDate)){
                  thisDayObject.type = "WORKING_DAY"
                  secondsTotal += secondsPerDay
                  workingDaysTotal++
                }
                if(nonWorkingDays.includes(thisDate)){
                  thisDayObject.type = "NON_WORKING_DAY"
                }
                returnValue.days.push(thisDayObject)
              }

              returnValue.numberOfWorkingDays = workingDaysTotal
              returnValue.requiredSeconds = secondsTotal

              return returnValue
            }
          }
        }
    },
    userScheduleUrl: (from,to)=>{
      return `/rest/tempo-core/1/user/schedule/?user=a.smith&from=${from}&to=${to}`
    }
}