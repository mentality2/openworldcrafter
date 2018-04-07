"use strict"

const dom = require('../dom.js')
const utils = require('../utils.js')

function createUploadModal(addFilesCb) {
    var uploadWindow = dom.modal("Upload Attachments", true)

    var fileArray = []
    var fileList = dom.table(["", "File", "Size"])
    fileList.classList.add("invisible")

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
        uploadWindow.hide()
    })
    var uploadAction = dom.span("Upload", ["button", "button-disabled"])
    uploadAction.addEventListener("click", () => {
        addFilesCb(fileArray)
        uploadWindow.hide()
    })
    actions.appendChild(cancelAction)
    actions.appendChild(uploadAction)

    uploadWindow.modal.appendChild(dropzone)
    uploadWindow.modal.appendChild(fileList)
    uploadWindow.modal.appendChild(actions)

    return uploadWindow
}

module.exports = createUploadModal
