'use strict';

const chromeUtils = require('./chromeUtils')
const stringUtils = require('./stringUtils')
const Tempo = require('./tempo')

const flexCalculator = async (settings) => {

  const tempo = new Tempo(settings)

  let flexValues = await Promise.all([
      tempo.fetchPeriodFlexTotal(),
      tempo.fetchFutureWorklogTotal()
  ])
  let [periodData, futureAdjustment] = flexValues
  return periodData - futureAdjustment
}

const getFlex = async () => {
  let settings = await chromeUtils.getSettings()
  let flex = await flexCalculator(settings)
  let flexString = await stringUtils.convertFlexToString(flex, settings.hoursPerDay)
  return flexString
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