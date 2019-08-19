'use strict';

const isWorkingDay = require('workingday-uk')

const chromeUtils = require('./chromeUtils')
const tempoUtils = require('./tempoUtils')
const stringUtils = require('./stringUtils')

const flexCalculator = (settings) => {
  const tempoPeriodsUrl = stringUtils.getTempoPeriodsUrl(settings)

  return isWorkingDay()
  .then(isWorkDay => {
    return Promise.all([
      tempoUtils.fetchPeriodDataFromTempoAndCalculateFlex(tempoPeriodsUrl),
      fetchTempoAdjustmentForToday(settings, isWorkDay),
      fetchTempoAdjustmentForFuture(settings)
    ])
  })
  .then(flexValues => {
    let [periodData, todayAdjustment, futureAdjustment] = flexValues
    return periodData + todayAdjustment - futureAdjustment
  })
  .catch(err => {
    return Promise.reject('Failed to get data from Tempo')
  })
}

const fetchTempoAdjustmentForToday = (settings, isWorkingDay) => {

  if (!isWorkingDay) { //If it's not a working day, then period data is accurate
    return Promise.resolve(0)
  }

  const workingDayInSeconds = settings.hoursPerDay * 60 * 60
  const worklogURL = stringUtils.getTempoWorklogsUrl(settings)

  return tempoUtils.fetchWorklogTotalFromTempo(worklogURL, settings.username)
    .then(totalSecondsToday => {
      let fudge = workingDayInSeconds //Credit back tempo's one-day debt at the beginning of the day
      if (totalSecondsToday >= workingDayInSeconds) { 
        fudge -= workingDayInSeconds //If you've worked over a full working day, credit that time back
      } else {
        fudge -= totalSecondsToday //...else don't include any work done today as additional flex
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