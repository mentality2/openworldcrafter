"use strict"

const dom = require('../dom.js')
const common = require('./common.js')

function createCharacterTab(object, ref) {
    var el = dom.span()

    common.nameEditor(object, el, ref)
    common.notes(object, el, ref)

    return el
}

module.exports = createCharacterTab
