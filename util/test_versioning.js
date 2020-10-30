const fs = require('fs')
const path = require('path')
const fileName = path.resolve(__dirname, '../dist/manifest.json')
const manifest = require(fileName)
    
manifest.version = manifest.version + '.' + getRandomString()

fs.writeFileSync(fileName, JSON.stringify(manifest, null, 2))

function getRandomString(){
    const randomFiveDigitNumber = Math.floor(Math.random() * 99999) + 1
    const randomFiveDigitString = ('0000' + randomFiveDigitNumber).slice(-5)
    return randomFiveDigitString
}