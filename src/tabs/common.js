"use strict"

const dom = require('../dom.js')
const markdown = require('../markdown')
const markdowntoolbar = require('./markdowntoolbar')

function createObjectBlurb(eventObject, ref, suffix) {
    var el = dom.div(undefined, "margin-bottom")

    var heading = dom.div()

    var link = dom.element("a", eventObject.name, ["bold", "cursor-pointer", "margin-right"])
    link.addEventListener("click", event => {
        ref.goToPage(eventObject)
    })
    heading.appendChild(link)

    if(suffix) {
        if(typeof suffix === "string") heading.appendChild(dom.span(suffix))
        else heading.appendChild(suffix)
    }

    el.appendChild(heading)

    var notes = eventObject.notes
    if(notes) {
        if(notes.length > 200) notes = notes.substring(0, 200) + "\u2026"
        el.appendChild(dom.span(notes))
    }

    return el
}

function nameEditor(object, el, ref) {
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

    tags(object, el, ref)
}

function notes(object, el, ref) {
    var notes = markdown.render(object.notes || "", "edit-invisible", ref)

    el.appendChild(notes)

    if(object.isEditable()) {
        var placeholderHelp = dom.placeholderHelp(`{$Click} {$edit} to edit your notes on ${ object.name }`)
        el.appendChild(placeholderHelp)
        function placeholderHelpCheck() {
            placeholderHelp.classList.toggle("invisible", object.notes || Object.keys(object.subobjects).length)
        }
        placeholderHelpCheck()

        var editorArea = dom.div(undefined, ["edit-visible", "flexbox-column", "flex-grow", "markdown-editor"])
        var notesText = dom.element("textarea", object.notes || "", ["flex-grow", "min-height-50-vh"])
        notesText.placeholder = "Add notes here"

        function onEdit() {
            if(notesText.value) {
                object.notes = notesText.value
                markdown.rerender(notes, notesText.value, ref)
            } else {
                notes.innerText = ""
                delete object.notes
            }

            object.markDirty()

            placeholderHelpCheck()
        }

        notesText.addEventListener("focus", () => {
            editorArea.classList.add("markdown-editor-focused")
        })
        notesText.addEventListener("blur", () => {
            // Use a timeout because the textbox is blurred before toolbar
            // buttons are clicked. This gives the button time to be clicked
            // before the layout is changed.
            setTimeout(() => {
                if(editorArea.contains(document.activeElement) || editorArea === document.activeElement) {
                    // don't remove the class because something inside the editor
                    // area is still focused, just not the textarea. probably a
                    // toolbar button
                } else {
                    editorArea.classList.remove("markdown-editor-focused")
                }
            }, 100)
        })

        notesText.addEventListener("input", onEdit)
        var mdToolbar = markdowntoolbar(notesText, onEdit, object)
        editorArea.appendChild(mdToolbar)
        editorArea.appendChild(notesText)
        el.appendChild(editorArea)
    }
}

function tags(object, el, ref) {
    var wrapper = dom.div(undefined, "margin-top-3px")
    if(!object.tags.length) wrapper.classList.add("edit-visible")

    var tagList = dom.span()
    for(var tag of object.tags) {
        createTagToken(tag)
    }
    wrapper.appendChild(tagList)

    function createTagToken(tag) {
        var tagObj = object.$project.getObjectById(tag)

        var tagWrapper = dom.div(undefined, "tag-wrapper")

        var tagButton = dom.span(tagObj.name, "tag-button")
        tagButton.addEventListener("click", () => {
            ref.goToPage(tagObj)
        })
        if(object.isEditable()) {
            var removeButton = dom.button("remove", undefined, event => {
                object.removeTag(tagObj.id)
                tagWrapper.remove()

                if(!object.tags.length) wrapper.classList.add("edit-visible")

                event.stopPropagation()
            }, ["edit-visible", "nobutton"])
            tagButton.appendChild(removeButton)
        }
        tagWrapper.appendChild(tagButton)

        var notes = tagObj.notes
        if(notes) {
            if(notes.length > 200) notes = notes.substring(0, 200) + "\u2026"
            tagWrapper.appendChild(dom.div(tagObj.notes, "tag-description"))
        }

        tagList.appendChild(tagWrapper)
        wrapper.classList.remove("edit-visible")
    }

    if(object.isEditable()) {
        var newTagWrapper = dom.span(undefined, ["edit-visible", "inline"])
        var newTag = dom.inputText(undefined, "Add Tag")

        newTag.addEventListener("keyup", e => {
            if(e.keyCode === 13) {
                addTagToObject()
            }
        })
        newTagWrapper.appendChild(newTag)

        var addTag = dom.button("add", undefined, () => {
            addTagToObject()
        })
        newTagWrapper.appendChild(addTag)

        wrapper.appendChild(newTagWrapper)

        function addTagToObject() {
            var tagName = newTag.value.trim()
            object.addTag(tagName)
            createTagToken(object.$project.getTagByName(tagName).id)
            newTag.value = ""
        }
    }

    el.appendChild(wrapper)
}

module.exports = {
    nameEditor, notes, createObjectBlurb
}
