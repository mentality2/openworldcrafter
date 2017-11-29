"use strict"

const dom = require('../dom.js')
const common = require('./common.js')

function createSnippetsTab(object, ref, trash) {
    var el = dom.div()

    el.appendChild(dom.div("Collect snippets of writing and use them later."))

    if(!trash) {
        // note that this is NOT edit-visible, for ease of use
        var newSnippetDiv = dom.div()

        var newSnippet = dom.element("textarea")
        newSnippet.rows = 6

        if(object.metadata.snippetInProgress) newSnippet.value = object.metadata.snippetInProgress
        newSnippet.addEventListener("change", () => {
            // not actually saved, but this prevents lost progress when switching tabs
            object.metadata.snippetInProgress = newSnippet.value
            object.$project.markDirty()
        })

        var addSnippet = dom.button(undefined, "Add Snippet", () => {
            var snippet = object.$project.addSnippet(newSnippet.value)

            // this is a placeholder object, so we have to call save on the project instead.
            // because changes are not made in edit mode, we autosave here
            object.$project.save(true)

            createSnippetBox(snippet)

            object.metadata.snippetInProgress = newSnippet.value = ""
        })

        newSnippetDiv.appendChild(newSnippet)
        newSnippetDiv.appendChild(addSnippet)

        el.appendChild(newSnippetDiv)
    }

    var contents = dom.div()

    var dummy = dom.div()
    contents.appendChild(dummy)
    var topSnippet = dummy

    function createSnippetBox(snippet) {
        // only show trash on the trash tab, and vice versa
        if((trash && !snippet.trash) || (!trash && snippet.trash)) return

        var snippetBox = dom.div(undefined, "snippet")
        if(snippet.spoiler) snippetBox.classList.add("spoiler")
        snippetBox.appendChild(dom.hr())

        var deleteTools = dom.div(undefined, "snippetdeletetools")
        if(trash) {
            var restoreButton = dom.button(undefined, "Restore", () => {
                snippet.trash = !snippet.trash
                snippetBox.remove()
                object.$project.save(true)
            })
            deleteTools.appendChild(restoreButton)
        }
        var deleteButton = dom.button("delete", undefined, () => {
            if(trash) {
                object.$project.removeSnippet(snippet)
            } else {
                snippet.trash = true
            }

            snippetBox.remove()
            object.$project.save(true)
        })
        deleteTools.appendChild(deleteButton)
        snippetBox.appendChild(deleteTools)

        var snippetText = dom.div(snippet.text)
        snippetBox.appendChild(snippetText)

        snippetBox.addEventListener("click", ev => {
            // create temporary textbox
            var textbox = dom.element("textarea", snippet.text)
            snippetBox.appendChild(textbox)

            textbox.select()
            try {
                document.execCommand("copy")

                var msg = dom.span("Copied to clipboard", ["copytoclipboard", "initial"])
                // insert it into the "delete tools" bar so it doesn't overlap the delete button
                deleteTools.insertBefore(msg, deleteTools.firstChild)

                setTimeout(() => msg.classList.remove("initial"), 10) // for transitions
                setTimeout(() => msg.classList.add("initial"), 3000)
                setTimeout(() => msg.remove(), 5000)
            } catch(e) {
                // TODO: error or something i guess
            }

            // ok now remove it
            textbox.remove()
        })

        contents.insertBefore(snippetBox, topSnippet)
        topSnippet = snippetBox
    }

    var snippets = object.$project.snippets
    for(var snippet of snippets) {
        createSnippetBox(snippet)
    }

    el.appendChild(contents)

    return el
}

function createSnippetsTrashTab(object, ref) {
    return createSnippetsTab(object, ref, true)
}

module.exports = {
    createSnippetsTab, createSnippetsTrashTab
}
