'use strict';

const humanizeDuration = require('humanize-duration')
const isWorkingDay = require('workingday-uk')
const testMode = false

const flexCalculator = (data = [{}], settings) => {
  const flexAccumulator = (accumulator, currentValue) => {
    return accumulator + currentValue.workedSeconds - currentValue.requiredSecondsRelativeToday
  }

  let initialBalance = data.reduce(flexAccumulator, 0)

  return isWorkingDay()
  .catch(err => {
    return Promise.reject('Couldn\'t fetch working day information')
  })
  .then(isWorkDay => {
    if(!isWorkDay){
      return Promise.resolve(initialBalance)
    } else {
      return getTempoFudgeForToday(settings)
        .then(fudge => {
          return Promise.resolve(initialBalance - fudge)
        })
    }
  })
  .catch(err => {
    return Promise.reject('Failed to get today from Tempo')
  })
}

const getTempoFudgeForToday = (settings) => {
  const todayAccumulator = (accumulator, currentValue) => {
    return accumulator + currentValue.timeSpentSeconds
  }

  let fudge = 0
  const workingDayInSeconds = 7.5 * 60 * 60
  
  fudge = fudge - workingDayInSeconds //Remove tempo's 7.5 debt at the beginning of the day
  const worklogURL = getTempoWorklogsUrl(settings)
  
  return fetchWorklogDataFromTempo(worklogURL, settings.username)
  .then(today => {
    const totalSecondsToday = today.reduce(todayAccumulator, 0)
    if(totalSecondsToday >= workingDayInSeconds){
      fudge += workingDayInSeconds
    } else {
      fudge += totalSecondsToday
    }
    return Promise.resolve(fudge)
  })
}

const getFlexDirectionText = (flex) => {
  if (flex < 0) {
    return 'behind'
  }
  if (flex > 0) {
    return 'ahead'
  }
  return 'exactly'
}

const flexPrinter = (seconds) => {
  const flexDirection = getFlexDirectionText(seconds) // ahead/behind
  const positiveSeconds = Math.abs(seconds) //Deal with positive numbers - we're already got direction
  const dayInSeconds = 7.5 * 60 * 60  //7.5 hours in seconds
  const daysOfFlex = Math.floor(positiveSeconds / dayInSeconds)
  const remainingSeconds = positiveSeconds - (daysOfFlex * dayInSeconds)
  const readableDuration = humanizeDuration(remainingSeconds * 1000)
  
  let printerText = (daysOfFlex > 0 ? `${daysOfFlex} days, ` : '') //Number of days
  printerText += `${readableDuration} ${flexDirection}`
  return printerText
}

const getSettings = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['jiraBaseUrl', 'periods', 'username'], (settings) => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError);
        reject('Failed to get settings from Chrome Storage')
      } else if (!settings) {
        console.warn('Failed to get settings - Empty settings returned')
        reject(new Error('Check your settings!'))
      } else {
        resolve(settings)
      }
    })
  })
}

const getTempoPeriodsUrl = (settings) => {
  const relativePath = `/rest/tempo-timesheets/4/timesheet-approval/approval-statuses/?userKey=${settings.username}&numberOfPeriods=${settings.periods}`
  const tempoUrl = new URL(relativePath, settings.jiraBaseUrl).toString()
  return tempoUrl
}

const getTempoWorklogsUrl = (settings) => {
  const relativePath = '/rest/tempo-timesheets/4/worklogs/search'
  const tempoUrl = new URL(relativePath, settings.jiraBaseUrl).toString()
  return tempoUrl
}

const fetchPeriodDataFromTempo = (tempoUrl) => {
  if (testMode) {
    const testdata = [
      {
        'user': {
          'self': 'https://jira.surevine.net/rest/api/2/user?username=danc',
          'name': 'danc',
          'key': 'danc',
          'displayName': 'Dan Caseley',
          'avatar': 'https://jira.surevine.net/secure/useravatar?size=small&ownerId=danc&avatarId=11585'
        },
        'status': 'open',
        'workedSeconds': 525600,
        'submittedSeconds': 0,
        'requiredSeconds': 567000,
        'requiredSecondsRelativeToday': 513000,
        'period': {
          'periodView': 'PERIOD',
          'dateFrom': '2019-05-01',
          'dateTo': '2019-05-31'
        },
        'smartDateString': 'Current period',
        'worklogs': {
          'href': 'https://jira.surevine.net/rest/tempo-timesheets/3/worklogs?username=danc&dateFrom=2019-05-01&dateTo=2019-05-31'
        }
      },
      {
        'user': {
          'self': 'https://jira.surevine.net/rest/api/2/user?username=danc',
          'name': 'danc',
          'key': 'danc',
          'displayName': 'Dan Caseley',
          'avatar': 'https://jira.surevine.net/secure/useravatar?size=small&ownerId=danc&avatarId=11585'
        },
        'status': 'ready_to_submit',
        'workedSeconds': 529200,
        'submittedSeconds': 0,
        'requiredSeconds': 540000,
        'requiredSecondsRelativeToday': 540000,
        'period': {
          'periodView': 'PERIOD',
          'dateFrom': '2019-04-01',
          'dateTo': '2019-04-30'
        },
        'smartDateString': 'Last period',
        'worklogs': {
          'href': 'https://jira.surevine.net/rest/tempo-timesheets/3/worklogs?username=danc&dateFrom=2019-04-01&dateTo=2019-04-30'
        }
      },
      {
        'user': {
          'self': 'https://jira.surevine.net/rest/api/2/user?username=danc',
          'name': 'danc',
          'key': 'danc',
          'displayName': 'Dan Caseley',
          'avatar': 'https://jira.surevine.net/secure/useravatar?size=small&ownerId=danc&avatarId=11585'
        },
        'status': 'ready_to_submit',
        'workedSeconds': 575100,
        'submittedSeconds': 0,
        'requiredSeconds': 567000,
        'requiredSecondsRelativeToday': 567000,
        'period': {
          'periodView': 'PERIOD',
          'dateFrom': '2019-03-01',
          'dateTo': '2019-03-31'
        },
        'smartDateString': 'Period 2019-03-01',
        'worklogs': {
          'href': 'https://jira.surevine.net/rest/tempo-timesheets/3/worklogs?username=danc&dateFrom=2019-03-01&dateTo=2019-03-31'
        }
      },
      {
        'user': {
          'self': 'https://jira.surevine.net/rest/api/2/user?username=danc',
          'name': 'danc',
          'key': 'danc',
          'displayName': 'Dan Caseley',
          'avatar': 'https://jira.surevine.net/secure/useravatar?size=small&ownerId=danc&avatarId=11585'
        },
        'status': 'ready_to_submit',
        'workedSeconds': 542700,
        'submittedSeconds': 0,
        'requiredSeconds': 540000,
        'requiredSecondsRelativeToday': 540000,
        'period': {
          'periodView': 'PERIOD',
          'dateFrom': '2019-02-01',
          'dateTo': '2019-02-28'
        },
        'smartDateString': 'Period 2019-02-01',
        'worklogs': {
          'href': 'https://jira.surevine.net/rest/tempo-timesheets/3/worklogs?username=danc&dateFrom=2019-02-01&dateTo=2019-02-28'
        }
      },
      {
        'user': {
          'self': 'https://jira.surevine.net/rest/api/2/user?username=danc',
          'name': 'danc',
          'key': 'danc',
          'displayName': 'Dan Caseley',
          'avatar': 'https://jira.surevine.net/secure/useravatar?size=small&ownerId=danc&avatarId=11585'
        },
        'status': 'ready_to_submit',
        'workedSeconds': 624600,
        'submittedSeconds': 0,
        'requiredSeconds': 594000,
        'requiredSecondsRelativeToday': 594000,
        'period': {
          'periodView': 'PERIOD',
          'dateFrom': '2019-01-01',
          'dateTo': '2019-01-31'
        },
        'smartDateString': 'Period 2019-01-01',
        'worklogs': {
          'href': 'https://jira.surevine.net/rest/tempo-timesheets/3/worklogs?username=danc&dateFrom=2019-01-01&dateTo=2019-01-31'
        }
      }
    ]
    return Promise.resolve(testdata)
  }
  return makeRequest('GET', tempoUrl)
  .catch(err => {
    return Promise.reject('Failed to fetch previous periods from Tempo')
  });
}

const fetchWorklogDataFromTempo = (tempoUrl, username) => {
  if (testMode) {
    return Promise.resolve({})
  }
  
  const today = getTodayString()
  return makeRequest('POST', tempoUrl, `{"worker":["${username}"], "from": "${today}", "to": "${today}"}`)
}

function makeRequest(method, url, body) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.responseText))
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
    if(body){
      xhr.send(body)
    } else {
      xhr.send()
    }
  })
}

const setPopupText = (text, colour = 'black') => {
  let flexInfo = document.getElementById('flextime')
  flexInfo.innerText = text
  flexInfo.style = `color: ${colour}`
}

const getTodayString = () => {
  return (new Date()).toISOString().substring(0, 10)
}

let settings = {}
getSettings()
  .then((settingsFromStorage) => {
    settings = settingsFromStorage
    const tempoUrl = getTempoPeriodsUrl(settings)
    return fetchPeriodDataFromTempo(tempoUrl)
  })
  .then((data) => {
    return flexCalculator(data, settings)
  })
  .then((flex) => {
    const flexText = flexPrinter(flex)
    console.log(flexText)
    setPopupText(flexText)
  })
  .catch(err => {
    setPopupText(err, 'red')
  })