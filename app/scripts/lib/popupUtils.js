'use strict';

const isWorkingDay = require('workingday-uk')

const chromeUtils = require('./chromeUtils')
const tempoUtils = require('./tempoUtils')
const stringUtils = require('./stringUtils')

const flexCalculator = (settings) => {
  const tempoPeriodsUrl = stringUtils.getTempoPeriodsUrl(settings)
  let flexBalance = 0

  return tempoUtils.fetchPeriodDataFromTempoAndCalculateFlex(tempoPeriodsUrl)
    .then(initalFlex => {
      flexBalance = initalFlex
      return isWorkingDay()
    })
    .catch(err => {
      return Promise.reject('Couldn\'t fetch working day information')
    })
    .then(isWorkDay => {
      return fetchTempoAdjustmentForToday(settings, isWorkDay)
    })
    .then(todayFudge => {
      flexBalance = flexBalance + todayFudge
      return fetchTempoAdjustmentForFuture(settings)
    })
    .then(futureFudge => {
      flexBalance = flexBalance - futureFudge
      return Promise.resolve(flexBalance)
    })
    .catch(err => {
      return Promise.reject('Failed to get data from Tempo')
    })
}


const fetchTempoAdjustmentForToday = (settings, isWorkingDay = true) => {

  if (!isWorkingDay) { //If it's not a working day, then period data is accurate
    return Promise.resolve(0)
  }

  const workingDayInSeconds = settings.hoursPerDay * 60 * 60
  const worklogURL = stringUtils.getTempoWorklogsUrl(settings)

  return tempoUtils.fetchWorklogTotalFromTempo(worklogURL, settings.username)
    .then(totalSecondsToday => {
      let fudge = workingDayInSeconds //Credit back tempo's one-day debt at the beginning of the day
      if (totalSecondsToday >= workingDayInSeconds) { //...but don't include any work done today as additional flex
        fudge -= workingDayInSeconds //...unless you've worked over a full working day
      } else {
        fudge -= totalSecondsToday
      }
      return Promise.resolve(fudge)
    })
}

const fetchTempoAdjustmentForFuture = (settings) => { //You can't flex today because you've already booked time that you'll do tomorrow
  const worklogURL = stringUtils.getTempoWorklogsUrl(settings)
  return tempoUtils.fetchFutureWorklogTotalFromTempo(worklogURL, settings.username)
}

const getFlex = () => {
  let settings = {}

  return chromeUtils.getSettings()
    .then(settingsFromStorage => {
      settings = settingsFromStorage
      return flexCalculator(settings)
    })
    .then(flex => {
      return stringUtils.convertFlexToString(flex, settings.hoursPerDay)
    })
    .catch(err => {
      return Promise.reject(err)
    })
}

module.exports = {
  getFlex
}