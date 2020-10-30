const fs = require('fs')
const path = require('path')
const fileName = path.resolve(__dirname, '../dist/manifest.json')
const manifest = require(fileName)
    
manifest.version = manifest.version + '.' + getDateString()

fs.writeFileSync(fileName, JSON.stringify(manifest, null, 2))

function getDateString(){
    const now = new Date()
    let dateString = ''
    dateString += now.getFullYear()
    dateString += padForTwoDigits(now.getMonth() + 1)
    dateString += padForTwoDigits(now.getDate())
    dateString += padForTwoDigits(now.getHours())
    dateString += padForTwoDigits(now.getMinutes())
    return dateString
}

function padForTwoDigits(value){
    return ('0' + value).slice(-2)
}