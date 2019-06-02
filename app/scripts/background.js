'use strict';

chrome.runtime.onInstalled.addListener(details => {
  if (details.OnInstalledReason == 'install') {
    const defaults = {
      jiraBaseUrl: 'https://myjira.net',
      periods: (new Date()).getMonth() + 1,
      includeToday: false,
      username: 'jbloggs'
    }
    chrome.storage.sync.set(defaults, function () {
      console.log('TempoFlex defaults set: ' + JSON.stringify(defaults));
    })
  }
})