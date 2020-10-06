const TempoError = require('./errorUtils').TempoError

const _makeRequest = (method, url, body) => {
    return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest()
            xhr.open(method, url)
            xhr.setRequestHeader('Content-Type', 'application/json')
            xhr.setRequestHeader('User-Agent', 'tempo-flex')
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText))
                    } catch(e) {
                        reject('Unexpected content from Tempo')
                    }
                    
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
            /* istanbul ignore next */ //Testing HTTP timeouts is too hard.
            xhr.timeout = 10000
            /* istanbul ignore next */
            xhr.ontimeout = function () {
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
        .catch(e => {
            switch (e.status) {
                case 401:
                case 403:
                    throw new TempoError('Not authorised with Jira')
                case 404:
                    throw new TempoError('Jira not found')
                case 0:
                    throw new TempoError('Jira couldn\'t be contacted')
                default:
                    throw e
            }
        })
}

const makeRequest = async (url, method, payload, error) => {
    try {
        return await _makeRequest(method, url, payload)
    }
    catch(err) {
        let thisErr = err instanceof TempoError ? err : new TempoError(error)
        return Promise.reject(thisErr)
    }
}

module.exports = {
    makeRequest
}