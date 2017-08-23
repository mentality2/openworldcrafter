"use strict"

const TabArea = require('./tabarea.js')
const dom = require('../dom.js')

function createTabArea(project) {
    var el = dom.div()
    return {
        el, obj: new TabArea(el, project)
    }
}

module.exports = {
    TabArea,
    createTabArea,
    createTabset: require("./tabsets.js")
}
