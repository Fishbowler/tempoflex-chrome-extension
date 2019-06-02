'use strict';

const humanizeDuration = require('humanize-duration')
const testMode = false

const flexCalculator = (data = [{}]) => {
    const flexAccumulator = (accumulator, currentValue)=>{
        return accumulator + currentValue.workedSeconds - currentValue.requiredSecondsRelativeToday
    }
    return data.reduce(flexAccumulator, 0)
}

const getFlexDirectionText = (flex) => {
  if(flex < 0){ return 'behind'}
  if(flex > 0){ return 'ahead'}
  return 'exactly'
}

const flexPrinter = (seconds) => {
  return humanizeDuration(seconds * 1000) + ' ' + getFlexDirectionText(seconds)
}

const getSettings = (callback) => {
    chrome.storage.sync.get(['jiraBaseUrl', 'periods', 'username'], callback)
}

const getTempoUrl = (settings, callback) => {
    const relativePath = `/rest/tempo-timesheets/4/timesheet-approval/approval-statuses/?userKey=${settings.username}&numberOfPeriods=${settings.periods}`
    const tempoUrl = new URL(relativePath, settings.jiraBaseUrl).toString()
    callback(tempoUrl)
}

const getData = (callback) => {
    if(testMode){
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
        callback(testdata)
        return
    }
    getSettings(
        getTempoUrl(settings, (tempoUrl) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', tempoUrl, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    callback(JSON.parse(xhr.responseText));
                }
            }
            xhr.send();
        })
    );
}

const setPopupText = (text) => {
  let flexInfo = document.getElementById('flextime')
  flexInfo.innerText = text
}

getData((response) => {
    const flex = flexCalculator(response)
    const flexText = flexPrinter(flex)
    console.log(flexText)
    setPopupText(flexText)
})