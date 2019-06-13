const getSettings = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['jiraBaseUrl', 'periods', 'username'], (settings) => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError);
        reject('Failed to get settings from Chrome Storage')
      } else if (!settings) {
        console.warn('Failed to get settings - Empty settings returned')
        reject(new Error('Check your settings!'))
      } else {
        resolve(settings)
      }
    })
  })
}

module.exports = {getSettings}