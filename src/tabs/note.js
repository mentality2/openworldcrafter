"use strict"

const dom = require('../dom.js')
const common = require('./common.js')

function createNoteTab(object, ref) {
    var el = dom.div()

    common.nameEditor(object, el)
    common.notes(object, el, ref)

    return el
}

module.exports = createNoteTab
