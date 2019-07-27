'use strict';

const isWorkingDay = require('workingday-uk')

const chromeUtils = require('./lib/chromeUtils')
const tempoUtils = require('./lib/tempoUtils')
const stringUtils = require('./lib/stringUtils')

const flexCalculator = (data = [{}], settings) => {
  const flexAccumulator = (accumulator, currentValue) => {
    return accumulator + currentValue.workedSeconds - currentValue.requiredSecondsRelativeToday
  }

  const initialBalance = data.reduce(flexAccumulator, 0)
  let runningBalance = initialBalance

  return isWorkingDay()
  .catch(err => {
    return Promise.reject('Couldn\'t fetch working day information')
  })
  .then(isWorkDay => {
    const fudgeFunction = isWorkDay ? getTempoFudgeForToday : function(){Promise.resolve(0)}
    return fudgeFunction(settings)
  })
  .then(todayFudge => {
    runningBalance = runningBalance - todayFudge
    return getTempoFudgeForFuture(settings)
  })
  .then(futureFudge => {
    runningBalance = runningBalance - futureFudge
    return Promise.resolve(runningBalance)
  })
  .catch(err => {
    return Promise.reject('Failed to get data from Tempo')
  })
}

const getTempoFudgeForToday = (settings) => {

  const workingDayInSeconds = settings.hoursPerDay * 60 * 60
  const worklogURL = stringUtils.getTempoWorklogsUrl(settings)
  
  return tempoUtils.fetchWorklogTotalFromTempo(worklogURL, settings.username)
  .then(totalSecondsToday => {
    let fudge = 0 - workingDayInSeconds //Remove tempo's one-day debt at the beginning of the day
    if(totalSecondsToday >= workingDayInSeconds){
      fudge += workingDayInSeconds
    } else {
      fudge += totalSecondsToday
    }
    return Promise.resolve(fudge)
  })
}

const getTempoFudgeForFuture = (settings) => {
  const worklogURL = stringUtils.getTempoWorklogsUrl(settings)
  return tempoUtils.fetchFutureWorklogTotalFromTempo(worklogURL, settings.username)
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