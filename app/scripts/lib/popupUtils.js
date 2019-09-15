'use strict';

const chromeUtils = require('./chromeUtils')
const stringUtils = require('./stringUtils')
const Tempo = require('./tempo')

const flexCalculator = (settings) => {

  const tempo = new Tempo(settings)

  return Promise.all([
      tempo.fetchPeriodFlexTotal(),
      tempo.fetchFutureWorklogTotal()
  ])
  .then(flexValues => {
    let [periodData, futureAdjustment] = flexValues
    return periodData - futureAdjustment
  })
  .catch(err => {
    return Promise.reject(err)
  })
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

const setPopupText = (_document, text, colour = 'black') => {
  let flexInfo = _document.getElementById('flextime')
  flexInfo.innerText = text
  flexInfo.style = `color: ${colour}`
}

module.exports = {
  getFlex,
  setPopupText
}