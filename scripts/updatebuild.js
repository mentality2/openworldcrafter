#!/usr/bin/env node

const fs = require('fs')

const buildType = process.argv[2] || "general"

var file = JSON.parse(fs.readFileSync("package.json", "utf-8"))
if(!file.buildinfo) {
    file.buildinfo = {}
}

if(!file.buildinfo[buildType]) {
    file.buildinfo[buildType] = {
        buildnumber: 0
    }
}

file.buildinfo[buildType].datestring = new Date().toISOString().slice(0, 19).replace("T", " "),
file.buildinfo[buildType].timestamp = new Date().getTime(),
file.buildinfo[buildType].buildnumber ++

console.log(`Build ${ buildType }-${ file.buildinfo[buildType].buildnumber } created ${ file.buildinfo[buildType].datestring }`)

fs.writeFileSync("package.json", JSON.stringify(file, undefined, 2))
