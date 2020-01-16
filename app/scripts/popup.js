const popupUtils = require('./lib/popupUtils')

popupUtils.getFlex()
.then(flex => {
    popupUtils.setPopupText(document, flex)
})
.catch(err => {
    popupUtils.setPopupText(document, err.message, 'red')
})

document.getElementById('settings').addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });