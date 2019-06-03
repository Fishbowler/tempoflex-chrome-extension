'use strict';

const defaults = {
    jiraBaseUrl: 'https://myjira.net',
    periods: (new Date()).getMonth() + 1,
    includeToday: false,
    username: 'jbloggs'
  }

const saveOptions = () => {
    const options = {
        jiraBaseUrl: document.getElementById('jiraURL').value,
        username: document.getElementById('username').value,
        includeToday: document.getElementById('includeToday').checked
    }

    const optionsToSave = Object.assign({}, defaults, options)

    chrome.storage.sync.set(optionsToSave, ()=>{
        var status = document.getElementById('saved');
        status.textContent = 'Options saved.';
        setTimeout(function() {
          status.textContent = '';
        }, 750);
    })
}

const restoreOptions = () => {
    const keys = Object.keys(defaults)
    chrome.storage.sync.get(keys, (options)=>{
        const displayableOptions = Object.assign({}, defaults, options)
        document.getElementById('jiraURL').value = displayableOptions.jiraBaseUrl,
        document.getElementById('username').value = displayableOptions.username,
        document.getElementById('includeToday').checked = displayableOptions.includeToday
    })
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);