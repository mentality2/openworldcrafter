"use strict"

const dom = require('../dom.js')
const utils = require('../utils.js')
const icons = require('../../resources/icons')
const api = require('../api')
const attachmentviewer = require('./attachmentviewer.js')
const uploadmodal = require("./uploadmodal.js")

function createAttachmentTab(object) {
    var el = dom.span()

    var attachmentViewer = new attachmentviewer(object.$project)

    var placeholderHelp = dom.placeholderHelp(`{$Click} {$edit}, then "Upload" to add attachments.`)
    el.appendChild(placeholderHelp)

    if(object.isEditable()) {
        // edit controls
        var editControls = dom.div("", ["edit-visible", "margin-top-3px"])

        if($owf.mobile) {
            // on mobile, use the native image picker instead of our modal
            // this is accomplished by using a "shadow" file input and clicking
            // it when the upload button is clicked
            var input = dom.element("input", "", "invisible")
            input.type = "file"
            input.multiple = true
            input.accept = "image/*"
            input.onchange = () => {
                addFiles(input.files)
            }

            var upload = dom.button(null, "Upload", () => {
                input.click()
            })

            el.appendChild(input)
            el.appendChild(upload)
        } else {
            var upload = dom.button(null, "Upload", () => {
                uploadmodal(addFiles).show()
            })
            el.appendChild(upload)
        }

        function addFiles(fileArray) {
            for(var file of fileArray) {
                object.$project.addAsset(file, id => {
                    object.attachments.push(id)
                    object.$project.markDirty()
                    addImage(id)
                })
            }
        }

        editControls.appendChild(upload)
        el.appendChild(editControls)
    }

    function addImage(attachment) {
        var assetInfo = object.$project.getAssetInfo(attachment)
        var image = dom.element("img", null, "thumbnail")
        object.$project.getAssetUrl(attachment, url => image.src = url)

        var line = dom.div()

        var detailTD = dom.span(undefined, ["padding-left", "padding-right", "mobile-invisible"])

        var name = dom.div(assetInfo.name || "", ["edit-invisible", "bold"])
        detailTD.appendChild(name)
        if(object.isEditable()) {
            var editTools = dom.div(undefined, "edit-visible")
            var nameEdit = dom.inputText(assetInfo.name || "", "Name")
            nameEdit.addEventListener("change", () => {
                name.textContent = assetInfo.name = nameEdit.value
                object.markDirty()
            })
            // otherwise the window will open when you click the input
            nameEdit.addEventListener("click", e => e.stopPropagation())
            editTools.appendChild(nameEdit)

            var del = dom.button("delete", undefined, event => {
                event.stopPropagation()
                object.$project.removeAsset(attachment, () => {
                    line.remove()
                    if(object.attachments.includes(attachment)) object.attachments.splice(object.attachments.indexOf(attachment), 1)
                    object.markDirty()
                })
            })
            editTools.appendChild(del)

            detailTD.appendChild(editTools)
        }

        var caption = dom.span(assetInfo.caption || "", "edit-invisible")
        detailTD.appendChild(caption)
        if(object.isEditable()) {
            var captionEdit = dom.element("textarea", assetInfo.caption || "", ["textarea-fullwidth", "textarea-short", "edit-visible"])
            captionEdit.addEventListener("change", () => {
                caption.textContent = assetInfo.caption = captionEdit.value
                object.markDirty()
            })
            // otherwise the window will open when you click the textarea
            captionEdit.addEventListener("click", e => e.stopPropagation())
            detailTD.appendChild(captionEdit)
        }

        line.addEventListener("click", () => {
            attachmentViewer.showAttachment(attachment)
        })

        line.appendChild(image)
        line.appendChild(detailTD)

        content.appendChild(line)

        placeholderHelp.classList.add("invisible")
    }

    var content = dom.span(undefined, "attachments")

    if(object.attachments && object.attachments.length) {
        for(var attachment of object.attachments) {
            addImage(attachment)
        }
    }

    el.appendChild(content)

    return el
}

module.exports = createAttachmentTab
