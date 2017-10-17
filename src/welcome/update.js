"use strict"

const https = require('https')

function checkUpdates(cb) {
    https.get('https://raw.githubusercontent.com/openworldfactory/openworldfactory/master/package.json', (res) => {
        if(res.statusCode !== 200) {
            console.log("Cannot check for updates; fetching package.json returned " + res.statusCode)
            res.resume()
            return
        }

        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', chunk => rawData += chunk)
        res.on('end', () => {
            try {
                cb(JSON.parse(rawData))
            } catch (e) {
                console.log("Cannot check for updates", e.message)
            }
        })
    }).on('error', e => {
        console.error("Cannot check for updates", e.message)
    })
}

module.exports = checkUpdates
