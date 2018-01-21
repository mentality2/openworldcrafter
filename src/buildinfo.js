"use strict"

const packageJSON = require('../package.json')

const version = packageJSON.version
const buildinfo = packageJSON.buildinfo

const commitFull = process.env.OWC_COMMIT_ID
const commit = commitFull ? commitFull.substr(0, 7) : undefined

// returns a string describing the build, for debugging purposes
function getBuildString() {
    // version number
    var str = `v${ packageJSON.version }`

    if($owf && $owf.buildType) {
        var build = packageJSON.buildinfo[$owf.buildType]
        if(build) {
            str += ` build ${ $owf.buildType }-${ buildinfo[$owf.buildType].buildnumber }`
            str += ` created ${ buildinfo[$owf.buildType].datestring }`
        }
    }

    if(commit) {
        str += ` commit ${ commit }`
    }

    return str
}

module.exports = {
    packageJSON, version, buildinfo, commit, commitFull, getBuildString
}
