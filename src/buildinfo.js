"use strict"

const packageJSON = require('../package.json')

const version = packageJSON.version

const commitFull = process.env.OWC_COMMIT_ID
const commit = commitFull ? commitFull.substr(0, 7) : undefined

// returns a string describing the build, for debugging purposes
function getBuildString() {
    // version number
    var str = `v${ packageJSON.version }`

    if(commit) {
        str += ` commit ${ commit }`
    }

    return str
}

module.exports = {
    packageJSON, version, commit, commitFull, getBuildString
}
