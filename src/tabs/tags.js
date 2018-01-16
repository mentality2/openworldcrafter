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

    var tags = object.$project.getAllTags()
    if(tags.length) {
        var contents = dom.div(undefined, "edit-invisible")
        contents.appendChild(dom.h1("All Tags"))

        for(var id in tags) {
            contents.appendChild(common.createObjectBlurb(tags[id], ref))
        }

        el.appendChild(contents)
    } else {
        el.appendChild(dom.placeholderHelp("Tags make it easy to organize and group items in your project. Add a tag to an object and it will show up here.", "userdocs/organization/tags.md"))
    }


    return el
}

module.exports = {
    createTagTab,
    createTagMainTab
}
