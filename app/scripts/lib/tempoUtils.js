const TempoError = require('./errorUtils').TempoError

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

const getTempoUserScheduleUrl = (settings, from, to) => {
  const relativePath = `/rest/tempo-core/1/user/schedule/?user=${settings.username}&from=${from}&to=${to}`
  const tempoUrl = new URL(relativePath, settings.jiraBaseUrl).toString()
  return tempoUrl
}

const fetchPeriodDataFromTempo = (settings) => {
  const tempoUrl = getTempoPeriodsUrl(settings)
  return makeRequest('GET', tempoUrl)
    .catch(err => {
      if(err instanceof TempoError){
        return Promise.reject(err)
      }
      return Promise.reject('Failed to fetch previous periods from Tempo')
    });
}

const fetchPeriodDataFromTempoAndCalculateFlex = (settings) => {
  return fetchPeriodDataFromTempo(settings)
  .then(periodData => {
    return Promise.resolve(sumPeriodFlex(periodData))
  })
}

const fetchWorklogDataFromTempo = (settings) => {
  const tempoUrl = getTempoWorklogsUrl(settings)
  const username = settings.username
  const today = getTodayString()
  return makeRequest('POST', tempoUrl, `{"worker":["${username}"], "from": "${today}", "to": "${today}"}`)
    .catch(err => {
      if(err instanceof TempoError){
        return Promise.reject(err)
      }
      return Promise.reject('Failed to fetch previous worklogs from Tempo')
    });
}

const fetchWorklogTotalFromTempo = (settings) => {
  return fetchWorklogDataFromTempo(settings)
  .then((worklogs) => {
    return Promise.resolve(sumWorklogs(worklogs))
  })
}

const fetchFutureWorklogDataFromTempo = (settings) => {
  const tempoUrl = getTempoWorklogsUrl(settings)
  const username = settings.username
  const tomorrow = getTomorrowString()
  const thirtyDaysFromNow = getThirtyDaysFromNowString()
  return makeRequest('POST', tempoUrl, `{"worker":["${username}"], "from": "${tomorrow}", "to": "${thirtyDaysFromNow}"}`)
    .catch(err => {
      if(err instanceof TempoError){
        return Promise.reject(err)
      }
      return Promise.reject('Failed to fetch future worklogs from Tempo')
    });
}

const fetchFutureWorklogTotalFromTempo = (settings) => {
  return fetchFutureWorklogDataFromTempo(settings)
  .then((worklogs) => {
    return Promise.resolve(sumWorklogs(worklogs))
  })
}

const fetchUserScheduleDataFromTempo = (settings) => {
  const from = getTodayString()
  const to = getTodayString()
  const tempoUrl = getTempoUserScheduleUrl(settings, from, to)
  return makeRequest('GET', tempoUrl)
  .catch(err => {
    if(err instanceof TempoError){
      return Promise.reject(err)
    }
    return Promise.reject('Failed to fetch user schedule from Tempo')
  })
}

const sumPeriodFlex = (periods) => {
  const flexAccumulator = (accumulator, currentValue) => {
    return accumulator + currentValue.workedSeconds - currentValue.requiredSecondsRelativeToday
  }
  
  return periods.reduce(flexAccumulator, 0)
}

const sumWorklogs = (worklogs) => {
  const workAccumulator = (accumulator, currentValue) => {
    return accumulator + currentValue.timeSpentSeconds
  }

  return worklogs.reduce(workAccumulator, 0)
}

const getTodayString = () => {
  return formatDateStringForTempo(new Date())
}

const getTomorrowString = () => {
  let tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDateStringForTempo(tomorrow)
}

const getThirtyDaysFromNowString = () => {
  let thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  return formatDateStringForTempo(thirtyDaysFromNow)
}

const formatDateStringForTempo = (dateToFormat) => {
  return dateToFormat.toISOString().substring(0,10)
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
    /* istanbul ignore next */ //Testing HTTP timeouts is too hard.
    xhr.timeout = 10000
    /* istanbul ignore next */
    xhr.ontimeout = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      })
    }
    if (body) {
      xhr.send(body)
    } else {
      xhr.send()
    }
  })
  .catch(e => {
    switch(e.status){
      case 403: return Promise.reject(new TempoError('Not authorised with Jira'))
      case 404: return Promise.reject(new TempoError('Jira not found'))
      case 0: return Promise.reject(new TempoError('Jira couldn\'t be contacted'))
      default: return Promise.reject(e)
    }    
  })
}

module.exports = {
  fetchPeriodDataFromTempo,
  fetchPeriodDataFromTempoAndCalculateFlex,
  fetchWorklogDataFromTempo,
  fetchWorklogTotalFromTempo,
  fetchFutureWorklogDataFromTempo,
  fetchFutureWorklogTotalFromTempo,
  fetchUserScheduleDataFromTempo,
  sumWorklogs
}