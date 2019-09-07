const popupUtils = require('./lib/popupUtils')

popupUtils.getFlex()
.then(flex => {
    popupUtils.setPopupText(document, flex)
})
.catch(err => {
    popupUtils.setPopupText(document, err.message, 'red')
})