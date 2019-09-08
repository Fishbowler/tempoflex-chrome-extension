
const defaults = require('./defaults.js')

module.exports = {
    saveOptions: (_document) => {
        const updateStatus = (status) => {
            var statusElement = _document.getElementById('saved');
            statusElement.textContent = status
            setTimeout(function() {
                statusElement.textContent = '';
            }, 750);
        }

        const options = {
            jiraBaseUrl: _document.getElementById('jiraURL').value,
            username: _document.getElementById('username').value,
            hoursPerDay: _document.getElementById('hoursPerDay').value
        }

        let jiraUrl
        try{
            jiraUrl = new URL('/', options.jiraBaseUrl)
        } catch (e){
            updateStatus('Invalid Jira URL')
            return
        }
    
        const optionsToSave = Object.assign({}, defaults, options)
    
        chrome.storage.sync.set(optionsToSave, ()=>{
            updateStatus('Options saved.')
        })
        
        jiraUrl = new URL('/*', jiraUrl)
        const newJiraURLPermission = {origins: [jiraUrl.toString()]}
        chrome.permissions.request(newJiraURLPermission, (result)=>{
            if(result){
                console.log('User granted permission to use ' + jiraUrl.toString())
                return
            }
            console.log('Failed to get permission to use ' + jiraUrl.toString() + ' - maybe the user rejected it?')
            console.log(chrome.runtime.lastError)
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