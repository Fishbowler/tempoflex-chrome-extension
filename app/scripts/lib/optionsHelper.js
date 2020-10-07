const defaults = require('./defaults.js')
const settingsUtils = require('./utils/settingsUtils')
const dateUtils = require('./utils/dateUtils')

function updateStatus (_document, status) {
    var statusElement = _document.getElementById('saved')
    statusElement.innerHTML = status
    setTimeout(function () {
        statusElement.innerHTML = '&nbsp;'
    }, 750)
}

module.exports = {
    saveOptions: async (_document) => {
        
        try {
            const test = new URL('/', _document.getElementById('jiraURL').value)
        } catch (e) {
            updateStatus(_document, 'Invalid Jira URL')
            return
        }

        const options = {
            jiraBaseUrl: _document.getElementById('jiraURL').value,
            username: _document.getElementById('username').value,
            hoursPerDay: _document.getElementById('hoursPerDay').value,
            useStartDate: _document.getElementById('useStartDate').checked,
            startDate: _document.getElementById('startDate').value,
            developerSettingsVisible: _document.getElementById('developerSettingsVisible').value,
            developerModeEnabled: _document.getElementById('developerModeEnabled').checked,
        }
      
        const optionsToSave = Object.assign({}, defaults, options)

        try {
            await settingsUtils.setSettings(optionsToSave)
            updateStatus(_document, 'Options saved.')
        } catch(e) {
            updateStatus(_document, 'Failed to save options')
        }        
    },

    requestPermissions: (_document, _rawUrl) => {

        try {
            const test = new URL('/', _rawUrl)
        } catch (e) {
            updateStatus(_document, 'Invalid Jira URL')
            throw new Error('Invalid Jira URL')
        }
        
        let jiraUrl = new URL('/*', _rawUrl)
        const permissionsToRequest = {
            origins: [jiraUrl.toString()]
        }
        
        function onResponse(response) {
        if (response) {
            console.log('User granted permission to use ' + jiraUrl.toString())
        } else {
            //todo - should really tell the user something went wrong.
            console.log('Failed to get permission to use ' + jiraUrl.toString() + ' - maybe the user rejected it?')
            console.log(browser.runtime.lastError)
        }
        return browser.permissions.getAll();  
        }
    
        browser.permissions.request(permissionsToRequest)
        .then(onResponse)
    },

    restoreOptions: async (version, _document) => {

        let settings = await settingsUtils.getSettings()
        _document.getElementById('jiraURL').value = settings.jiraBaseUrl,
        _document.getElementById('username').value = settings.username
        _document.getElementById('hoursPerDay').value = settings.hoursPerDay
        _document.getElementById('useStartDate').checked = settings.useStartDate
        _document.getElementById('startDate').value = settings.startDate
        _document.getElementById('startDate').min = dateUtils.dateToYYYYMMDD(new Date(new Date().setFullYear(new Date().getFullYear() - 1)))
        _document.getElementById('developerModeEnabled').checked = settings.developerModeEnabled
        _document.getElementById('version').textContent = "Version:" + version
        
        if(settings.developerSettingsVisible) {
            _document.getElementById('developerModeWrapper').style.display = 'block';
        }

        var clicks = 0;
        _document.getElementById('version').addEventListener('click',function ()
        {
            ++clicks;

            if(clicks > 4) {
                _document.getElementById('developerModeWrapper').style.display = 'block';
                _document.getElementById('developerSettingsVisible').value = true;
            }
        });
    }
}
