"use strict"

const dom = require('../dom.js')
const common = require('./common.js')

function createTagTab(object, ref) {
    var el = dom.div()

    common.nameEditor(object, el, ref)
    common.notes(object, el, ref)

    var tagged = object.$project.getObjectsByTag(object.id)
    var contents = dom.div(undefined, "edit-invisible")
    contents.appendChild(dom.h1(`Tagged (${ tagged.length })`))

    for(var id in tagged) {
        contents.appendChild(common.createObjectBlurb(tagged[id], ref))
    }

    el.appendChild(contents)

    return el
}

function createTagMainTab(object, ref) {
    var el = dom.div()

    el.appendChild(dom.div("Tags make it easy to organize and group items in your project."))

    var contents = dom.div(undefined, "edit-invisible")
    contents.appendChild(dom.h1("All Tags"))

    var tags = object.$project.getAllTags()
    for(var id in tags) {
        contents.appendChild(common.createObjectBlurb(tags[id], ref))
    }

    if(!tags.length) contents.appendChild(dom.div("Add a tag to an object and it will show up here."))

    el.appendChild(contents)

    return el
}

module.exports = {
    createTagTab,
    createTagMainTab
}
