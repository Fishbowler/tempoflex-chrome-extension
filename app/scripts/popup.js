'use strict';

const isWorkingDay = require('workingday-uk')

const chromeUtils = require('./lib/chromeUtils')
const tempoUtils = require('./lib/tempoUtils')
const stringUtils = require('./lib/stringUtils')

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
  const workingDayInSeconds = settings.hoursPerDay * 60 * 60
  
  fudge = fudge - workingDayInSeconds //Remove tempo's one-day debt at the beginning of the day
  const worklogURL = stringUtils.getTempoWorklogsUrl(settings)
  
  return tempoUtils.fetchWorklogDataFromTempo(worklogURL, settings.username)
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

const setPopupText = (text, colour = 'black') => {
  let flexInfo = document.getElementById('flextime')
  flexInfo.innerText = text
  flexInfo.style = `color: ${colour}`
}

let settings = {}
chromeUtils.getSettings()
  .then((settingsFromStorage) => {
    settings = settingsFromStorage
    const tempoUrl = stringUtils.getTempoPeriodsUrl(settings)
    return tempoUtils.fetchPeriodDataFromTempo(tempoUrl)
  })
  .then((data) => {
    return flexCalculator(data, settings)
  })
  .then((flex) => {
    const flexText = stringUtils.flexPrinter(flex, settings.hoursPerDay)
    setPopupText(flexText)
  })
  .catch(err => {
    setPopupText(err, 'red')
  })