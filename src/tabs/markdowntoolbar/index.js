"use strict"

const dom = require('../../dom')
const path = require('path')
const emoji = require('./emoji')
const embedmodal = require('./embedmodal')
const search = require('../../search')

const tableText = `
| Table Header | Table Header |
|--------------|--------------|
| Table Data   | Table Data   |
`

function setLinePrefix(textarea, prefix) {
    var value = textarea.value
    var start = textarea.selectionStart
    var end = textarea.selectionEnd
    var lineStart = value.lastIndexOf("\n", start - 1) + 1

    textarea.value = value.slice(0, lineStart) + prefix + " " + value.slice(lineStart)
    textarea.setSelectionRange(start + prefix.length + 1, end + prefix.length + 1)
}

function wrapSelection(textarea, before, after) {
    var value = textarea.value
    var start = textarea.selectionStart
    var end = textarea.selectionEnd
    textarea.value = value.slice(0, start) + before + value.slice(start, end) + after + value.slice(end)
    textarea.setSelectionRange(start + before.length, end + before.length)
}

function insertRawText(textarea, text) {
    var value = textarea.value
    var start = textarea.selectionStart
    var end = textarea.selectionEnd
    textarea.value = value.slice(0, start) + text + value.slice(end)
    textarea.setSelectionRange(start, start + text.length)
}

function createMarkdownToolbar(editorArea, editCb, object) {
    var el = dom.div(undefined, "margin-bottom")

    function edit() {
        editorArea.focus()
        editCb()
    }

    var bold = dom.button("bold", undefined, () => {
        wrapSelection(editorArea, "**", "**")
        edit()
    })
    var italic = dom.button("italic", undefined, () => {
        wrapSelection(editorArea, "_", "_")
        edit()
    })
    var strikethrough = dom.button("strikethrough", undefined, () => {
        wrapSelection(editorArea, "~~", "~~")
        edit()
    })

    var header1 = dom.button("header1", undefined, () => {
        setLinePrefix(editorArea, "#")
        edit()
    })
    var header2 = dom.button("header2", undefined, () => {
        setLinePrefix(editorArea, "##")
        edit()
    })
    var header3 = dom.button("header3", undefined, () => {
        setLinePrefix(editorArea, "###")
        edit()
    })
    var separator = dom.button("separator", undefined, () => {
        insertRawText(editorArea, "\n\n-----\n\n")
        edit()
    })

    var quote = dom.button("quote", undefined, () => {
        setLinePrefix(editorArea, ">")
        edit()
    })
    var nlist = dom.button("nlist", undefined, () => {
        setLinePrefix(editorArea, "1.")
        edit()
    })
    var ulist = dom.button("nlist", undefined, () => {
        setLinePrefix(editorArea, "-")
        edit()
    })
    var table = dom.button("table", undefined, () => {
        insertRawText(editorArea, tableText)
        edit()
    })

    var emojiWrapper = dom.span(undefined, "emojiwrapper")
    var emojiPicker = emoji(text => {
        insertRawText(editorArea, text)
        edit()
    })
    var emojiButton = dom.button("emoji", undefined, () => {
        emojiPicker.classList.toggle("shown")
    })
    emojiWrapper.appendChild(emojiButton)
    emojiWrapper.appendChild(emojiPicker)

    var embed = dom.button("embed", undefined, () => {
        embedModal.show()
    })
    var embedModal = embedmodal(text => {
        insertRawText(editorArea, text)
        edit()
    })
    el.appendChild(embedModal.wrapper)

    var linkWrapper = dom.span()
    var link = dom.button("link", undefined, event => {
        var term = editorArea.value.substring(editorArea.selectionStart, editorArea.selectionEnd)

        if(/^https?:\/\/.*/.test(term)) {
            wrapSelection(editorArea, "<", ">")
            edit()
            return
        }

        var objectWithName
        for(var objId in object.$project.$allObjects) {
            var obj = object.$project.$allObjects[objId]
            if(obj.name.trim().toUpperCase() === term.trim().toUpperCase()) {
                if(objectWithName) {
                    // multiple objects with same name, let user choose
                    objectWithName = null
                    continue
                }
                objectWithName = obj
            }
        }

        if(objectWithName) {
            // exactly one object has a name that equals the selected text.
            // link to that object
            wrapSelection(editorArea, "[", `](${objectWithName.id})`)
            edit()
        } else {
            var box = linkSearch.querySelector(".searchbar-box")
            box.value = term || ""
            box.dispatchEvent(new CustomEvent("change"))
            linkSearch.classList.remove("invisible")
            box.focus()
        }
    })
    var linkSearch = search.createSearchBar(object.$project, insert => {
        linkSearch.classList.add("invisible")
        insertRawText(editorArea, `[${insert.name}](${insert.id})`)
        edit()
    })
    linkSearch.classList.add("invisible")
    linkWrapper.appendChild(link)
    linkWrapper.appendChild(linkSearch)

    var help = dom.button("help", undefined, () => {
        $owf.showDocs("userdocs/markdown_formatting.md")
    }, "float-right")

    el.appendChild(bold)
    el.appendChild(italic)
    el.appendChild(strikethrough)

    el.appendChild(dom.span(undefined, "margin-right"))

    el.appendChild(header1)
    el.appendChild(header2)
    el.appendChild(header3)
    el.appendChild(separator)

    el.appendChild(dom.span(undefined, "margin-right"))

    el.appendChild(quote)
    el.appendChild(nlist)
    el.appendChild(ulist)
    el.appendChild(table)

    el.appendChild(dom.span(undefined, "margin-right"))

    el.appendChild(emojiWrapper)
    el.appendChild(linkWrapper)
    el.appendChild(embed)

    el.appendChild(help)

    return el
}

module.exports = createMarkdownToolbar
