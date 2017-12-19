"use strict"

const attachments = require('./attachments.js')
const character = require('./character.js')
const note = require('./note.js')
const folder = require('./folder.js')
const timeline = require('./timeline.js')
const relationships = require('./relationships')
const event = require('./event.js')
const tags = require('./tags.js')
const charactersheet = require('./charactersheet')
const snippets = require('./snippets')

function attachmentsTab(tabview, object) {
    if(!(object.attachments && object.attachments.length) && !object.isEditable()) return

    var count = 0
    if(object.attachments) {
        count = object.attachments.length
    }
    tabview.addTab(`Attachments (${count})`, attachments(object), "link")
}

function createTabset(tabview, object, ref) {
    var name = object.name
    tabview.setPrintName(name)
    switch(object.type) {
        case "folder":
            tabview.addTab(name, folder(object, ref))
            break
        case "character":
            tabview.addTab(name, character(object, ref))
            tabview.addTab("Character Sheet", charactersheet.createCharacterSheetTab(object, ref), "clipboard")
            tabview.addTab("Relationships", relationships(object, ref), "heart")
            break
        case "note":
            tabview.addTab(name, note(object, ref))
            break
        case "timeline":
            tabview.addTab(name, timeline.createTimelineTab(object, ref))
            tabview.addTab("Calendar", timeline.createCalendarTab(object, ref), "calendar")
            break
        case "event":
            tabview.addTab(name, event(object, ref))
            break

        case "tagfolder":
            tabview.addTab(name, tags.createTagMainTab(object, ref))
            break
        case "tag":
            tabview.addTab(name, tags.createTagTab(object, ref))
            break
        case "snippets":
            tabview.addTabFunc(name, () => snippets.createSnippetsTab(object, ref))
            tabview.addTabFunc("Trash", () => snippets.createSnippetsTrashTab(object, ref))
            break
        case "characterchart":
            tabview.addTab(name, charactersheet.createCharacterChartTab(object, ref))
            break
    }

    attachmentsTab(tabview, object)
}

module.exports = createTabset
