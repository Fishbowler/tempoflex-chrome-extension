const fetchPeriodDataFromTempo = (tempoUrl) => {
  return makeRequest('GET', tempoUrl)
    .catch(err => {
      return Promise.reject('Failed to fetch previous periods from Tempo')
    });
}

const fetchWorklogDataFromTempo = (tempoUrl, username) => {
  const today = getTodayString()
  return makeRequest('POST', tempoUrl, `{"worker":["${username}"], "from": "${today}", "to": "${today}"}`)
}

const getTodayString = () => {
  return (new Date()).toISOString().substring(0, 10)
}

function makeRequest(method, url, body) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        })
      }
    }
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      })
    }
    if (body) {
      xhr.send(body)
    } else {
      xhr.send()
    }
  })
}

module.exports = {
  fetchPeriodDataFromTempo,
  fetchWorklogDataFromTempo
}