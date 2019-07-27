const getSettings = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['jiraBaseUrl', 'username', 'hoursPerDay'], (settings) => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError);
        reject(new Error('Failed to get settings from Chrome Storage'))
      } else if (!settings) {
        console.warn('Failed to get settings - Empty settings returned')
        reject(new Error('Check your settings!'))
      } else {
        let settingsWithPeriods = {}
        Object.assign(settingsWithPeriods,settings,{
          periods: (new Date()).getMonth() + 1
        })
        resolve(settingsWithPeriods)
      }
    })
  })
}

module.exports = {getSettings}