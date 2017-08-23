"use strict"

const dom = require('../dom.js')
const common = require('./common.js')

function createObjectBlurb(eventObject, ref) {
    var el = dom.div(undefined, "margin-left")

    var heading = dom.div()

    var link = dom.element("a", eventObject.name, ["bold", "cursor-pointer", "margin-right"])
    link.addEventListener("click", event => {
        ref.goToPage(eventObject)
    })
    heading.appendChild(link)

    el.appendChild(heading)

    var notes = eventObject.notes
    if(notes) {
        if(notes.length > 200) notes = notes.substring(0, 200) + "\u2026"
        el.appendChild(dom.span(notes))
    }

    return el
}

function createFolderTab(object, ref) {
    var el = dom.div()

    common.nameEditor(object, el)
    common.notes(object, el, ref)

    var contents = dom.div(undefined, "edit-invisible")
    contents.appendChild(dom.h1("Contents"))

    for(var id in object.subobjects) {
        contents.appendChild(createObjectBlurb(object.subobjects[id], ref))
    }

    if(Object.keys(object.subobjects).length) el.appendChild(contents)

    return el
}

module.exports = createFolderTab
