'use strict';

const saveOptions = () => {
    const options = {
        jiraBaseUrl: document.getElementById('jiraURL').value,
        username: document.getElementById('username').value,
        includeToday: document.getElementById('includeToday').checked
    }

    chrome.storage.sync.set(options, ()=>{
        var status = document.getElementById('saved');
        status.textContent = 'Options saved.';
        setTimeout(function() {
          status.textContent = '';
        }, 750);
    })
}

const restoreOptions = () => {
    const defaults = {
        jiraBaseUrl: 'https://myjira.net',
        periods: (new Date()).getMonth() + 1,
        includeToday: false,
        username: 'jbloggs'
    }

    chrome.storage.sync.get(defaults, (options)=>{
        document.getElementById('jiraURL').value = options.jiraBaseUrl,
        document.getElementById('username').value = options.username,
        document.getElementById('includeToday').checked = options.includeToday
    })
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);