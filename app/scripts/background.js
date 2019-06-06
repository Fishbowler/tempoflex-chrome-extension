'use strict';

const defaults = {
  jiraBaseUrl: 'https://myjira.net',
  periods: (new Date()).getMonth() + 1,
  username: 'jbloggs'
}

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == 'install') {
    chrome.storage.sync.set(defaults, function () {
      console.log('TempoFlex defaults set: ' + JSON.stringify(defaults));
    })
  }
})