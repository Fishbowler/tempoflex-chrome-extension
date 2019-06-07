'use strict';

const defaults = require('./lib/defaults.js')

const saveOptions = () => {
    const options = {
        jiraBaseUrl: document.getElementById('jiraURL').value,
        username: document.getElementById('username').value
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
        document.getElementById('username').value = displayableOptions.username
    })
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);