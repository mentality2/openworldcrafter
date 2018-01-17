#!/usr/bin/env node

"use strict"
/*
    Compiles all of the icons into a single javascript file that can be
    webpacked or required.
*/

const fs = require('fs')
const path = require('path')

var dir = path.join(__dirname, "..", "src", "icons", "plain")
var list = fs.readdirSync(dir)

var object = {}

for(var file of list) {
    object[file.match(/^\w+(?=\.svg$)/)[0]] = fs.readFileSync(path.join(dir, file), "utf8").trim()
}

fs.writeFileSync(path.join(__dirname, "..", "resources", "icons.json"), JSON.stringify(object))
