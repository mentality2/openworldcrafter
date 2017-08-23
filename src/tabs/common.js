"use strict"

const dom = require('../dom.js')
const markdown = require('../markdown')
const markdowntoolbar = require('./markdowntoolbar')

function nameEditor(object, el) {
    if(object.isEditable()) {
        var editNameSpan = dom.div("", ["edit-visible", "text-center-vertical"])

        var editNameLabel = dom.element("label", "Name:")
        var editName = dom.inputText(object.name)
        editName.onchange = () => {
            object.name = editName.value
            object.markDirty()
        }

        editNameSpan.appendChild(editNameLabel)
        editNameSpan.appendChild(editName)

        el.appendChild(editNameSpan)
    }
}

function notes(object, el, ref) {
    var notes = markdown.render(object.notes || "", "edit-invisible", ref)

    el.appendChild(notes)

    if(object.isEditable()) {
        var editorArea = dom.div(undefined, ["edit-visible", "flexbox-column", "flex-grow"])
        var notesText = dom.element("textarea", object.notes || "", "flex-grow")

        function onEdit() {
            if(notesText.value) {
                object.notes = notesText.value
                markdown.rerender(notes, notesText.value, ref)
            } else {
                notes.innerText = ""
                delete object.notes
            }
            object.markDirty()
        }

        notesText.addEventListener("keyup", onEdit)
        var mdToolbar = markdowntoolbar(notesText, onEdit, object)
        editorArea.appendChild(mdToolbar)
        editorArea.appendChild(notesText)
        el.appendChild(editorArea)
    }
}

module.exports = {
    nameEditor, notes
}
