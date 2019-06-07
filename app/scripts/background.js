'use strict';

const defaults = require('./lib/defaults.js')

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == 'install') {
    chrome.storage.sync.set(defaults, function () {
      console.log('TempoFlex defaults set: ' + JSON.stringify(defaults));
    })
  }
})