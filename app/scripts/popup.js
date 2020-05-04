const popupUtils = require('./lib/popupUtils')

async function fetchIt() {
  try {
    const flex = await popupUtils.getFlex()
    popupUtils.setPopupText(document, flex)
  }
  catch(err) {
      popupUtils.setPopupText(document, err.message, 'red')
  }
};

fetchIt()

document.getElementById('settings').addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});