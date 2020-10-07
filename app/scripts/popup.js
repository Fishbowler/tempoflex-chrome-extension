const popupUtils = require('./lib/popupHelper')

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

  if (browser.runtime.openOptionsPage) {
    browser.runtime.openOptionsPage();
  } else {
    window.open(browser.runtime.getURL('options.html'));
  }
});