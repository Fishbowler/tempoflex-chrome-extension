const defaults = require('./defaults.js')
const chromeUtils = require('./chromeUtils')

module.exports = {
    saveOptions: async (_document) => {
        const updateStatus = (status) => {
            var statusElement = _document.getElementById('saved');
            statusElement.textContent = status
            setTimeout(function () {
                statusElement.textContent = '';
            }, 750);
        }

        const options = {
            jiraBaseUrl: _document.getElementById('jiraURL').value,
            username: _document.getElementById('username').value,
            hoursPerDay: _document.getElementById('hoursPerDay').value,
            useStartDate: _document.getElementById('useStartDate').checked,
            startDate: _document.getElementById('startDate').value
        }

        let jiraUrl
        try {
            jiraUrl = new URL('/', options.jiraBaseUrl)
        } catch (e) {
            updateStatus('Invalid Jira URL')
            return
        }

        const optionsToSave = Object.assign({}, defaults, options)

        await chromeUtils.setSettings(optionsToSave)
        updateStatus('Options saved.')

        jiraUrl = new URL('/*', jiraUrl)
        const newJiraURLPermission = {
            origins: [jiraUrl.toString()]
        }
        chrome.permissions.request(newJiraURLPermission, (result) => {
            if (result) {
                console.log('User granted permission to use ' + jiraUrl.toString())
                return
            }
            console.log('Failed to get permission to use ' + jiraUrl.toString() + ' - maybe the user rejected it?')
            console.log(chrome.runtime.lastError)
        })
    },

    restoreOptions: async (_document) => {
        let settings = await chromeUtils.getSettings()
        _document.getElementById('jiraURL').value = settings.jiraBaseUrl,
        _document.getElementById('username').value = settings.username
        _document.getElementById('hoursPerDay').value = settings.hoursPerDay
        _document.getElementById('useStartDate').checked = settings.useStartDate
        _document.getElementById('startDate').value = settings.startDate
        _document.getElementById('startDate').min = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().substring(0, 10)
    }
}