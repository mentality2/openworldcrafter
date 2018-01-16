"use strict"

const dom = require('../dom.js')
const common = require('./common.js')

function createFolderTab(object, ref) {
    var el = dom.div()

    common.nameEditor(object, el, ref)
    common.notes(object, el, ref)

    var contents = dom.div(undefined, "edit-invisible")
    contents.appendChild(dom.h1("Contents"))

    for(var id in object.subobjects) {
        contents.appendChild(common.createObjectBlurb(object.subobjects[id], ref))
    }

    if(Object.keys(object.subobjects).length) el.appendChild(contents)


    return el
}

module.exports = createFolderTab
