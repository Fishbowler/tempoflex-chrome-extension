'use strict';
const Tempo = require('./tempo')

const getFlex = async () => {
  const tempo = new Tempo()
  await tempo.init()
  return await tempo.getFlexTotal()
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