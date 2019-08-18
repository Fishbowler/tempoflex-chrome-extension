const popupUtils = require('./lib/popupUtils')

const setPopupText = (text, colour = 'black') => {
    let flexInfo = document.getElementById('flextime')
    flexInfo.innerText = text
    flexInfo.style = `color: ${colour}`
  }

popupUtils.getFlex()
.then(flex => {
    setPopupText(flex)
})
.catch(err => {
    setPopupText(err, 'red')
})