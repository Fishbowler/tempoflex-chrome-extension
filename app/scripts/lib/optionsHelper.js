
const defaults = require('./defaults.js')

module.exports = {
    saveOptions: (_document) => {
        const options = {
            jiraBaseUrl: _document.getElementById('jiraURL').value,
            username: _document.getElementById('username').value,
            hoursPerDay: _document.getElementById('hoursPerDay').value
        }
    
        const optionsToSave = Object.assign({}, defaults, options)
    
        chrome.storage.sync.set(optionsToSave, ()=>{
            var status = _document.getElementById('saved');
            status.textContent = 'Options saved.';
            setTimeout(function() {
              status.textContent = '';
            }, 750);
        })
    },
    
    restoreOptions: (_document) => {
        const keys = Object.keys(defaults)
        chrome.storage.sync.get(keys, (options)=>{
            const displayableOptions = Object.assign({}, defaults, options)
            _document.getElementById('jiraURL').value = displayableOptions.jiraBaseUrl,
            _document.getElementById('username').value = displayableOptions.username
            _document.getElementById('hoursPerDay').value = displayableOptions.hoursPerDay
        })
    }
}