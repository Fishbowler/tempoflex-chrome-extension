'use strict';

import * as chromeUtils from './chromeUtils'
import * as stringUtils from './stringUtils'
import Tempo from './tempo'
import "regenerator-runtime/runtime.js";

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

export {
  getFlex,
  setPopupText
}