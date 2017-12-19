"use strict"

const dom = require('../dom.js')
const utils = require('../utils.js')
const icons = require('../../resources/icons')
const api = require('../api')
const attachmentviewer = require('./attachmentviewer.js')

function createUploadModal(addFilesCb) {
    var uploadWindow = dom.modal("Upload Attachments")

    var fileArray = []
    var fileList = dom.table(["", "File", "Size"])
    fileList.classList.add("invisible")

    function reset() {
        fileArray = []

        // reset file list
        utils.removeAllChildren(fileList)
        fileList.appendChild(dom.tr_headers(["", "File", "Size"]))

        fileList.classList.add("invisible")
        uploadAction.classList.add("button-disabled")
        dropzone.classList.remove("dropzone-short")
    }

    function addFiles(files) {
        for(var file of files) {
            fileArray.push(file)

            var tr = dom.tr([
                "",
                file.name,
                utils.bytesText(file.size)
            ])
            if(file.size > 1000000) {
                // tr.firstChild.innerHTML = icons.warning + " Too big"
            }

            fileList.appendChild(tr)
        }

        if(fileArray.length) {
            uploadAction.classList.remove("button-disabled")
        }

        input.value = null
        fileList.classList.remove("invisible")
        dropzone.classList.add("dropzone-short")
    }

    var dropzone = dom.div("", "dropzone")
    var dropzoneInside = dom.div()
    var input = dom.element("input", "", "no-margin-right")
    input.type = "file"
    input.multiple = true
    input.accept = "image/*"
    input.onchange = () => {
        addFiles(input.files)
    }
    dropzoneInside.appendChild(dom.div("Drag & Drop Files"))
    dropzoneInside.appendChild(dom.div("-- or --"))
    dropzoneInside.appendChild(input)

    dropzone.appendChild(dropzoneInside)

    dropzone.addEventListener("drop", event => {
        event.preventDefault()
        if(event.dataTransfer.files) {
            addFiles(event.dataTransfer.files)
        }
        dropzone.classList.remove("dropzone-active")
    })
    dropzone.addEventListener("dragover", event => {
        event.preventDefault()
    })
    dropzone.addEventListener("dragenter", event => {
        dropzone.classList.add("dropzone-active")
    })
    dropzone.addEventListener("dragleave", event => {
        dropzone.classList.remove("dropzone-active")
    })

    var actions = dom.div("", "modal-actions")
    var cancelAction = dom.span("Cancel", "button")
    cancelAction.addEventListener("click", () => {
        reset()
        uploadWindow.wrapper.classList.remove("modal-visible")
    })
    var uploadAction = dom.span("Upload", ["button", "button-disabled"])
    uploadAction.addEventListener("click", () => {
        addFilesCb(fileArray)
        reset()
        uploadWindow.wrapper.classList.remove("modal-visible")
    })
    actions.appendChild(cancelAction)
    actions.appendChild(uploadAction)

    uploadWindow.modal.appendChild(dropzone)
    uploadWindow.modal.appendChild(fileList)
    uploadWindow.modal.appendChild(actions)

    return uploadWindow
}

function createAttachmentTab(object) {
    var el = dom.span()

    var attachmentViewer = new attachmentviewer(object.$project)
    el.appendChild(attachmentViewer.el.wrapper)

    if(object.isEditable()) {
        // edit controls
        var editControls = dom.div("", ["edit-visible", "margin-top-3px"])

        if($owf.mobile) {
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
            var uploadModal = createUploadModal(addFiles)
            uploadModal.addToContainer()

            var upload = dom.button(null, "Upload", () => {
                uploadModal.show()
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
            attachmentViewer.setAttachment(attachment)
            attachmentViewer.el.show()
        })

        line.appendChild(image)
        line.appendChild(detailTD)

        content.appendChild(line)
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
