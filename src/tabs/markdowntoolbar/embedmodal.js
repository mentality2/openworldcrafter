"use strict"

const dom = require('../../dom')
const embed = require('../../markdown/embed')

function createEmbedModal(insertCb) {
    var modal = dom.modal("Embed Video")

    var modalActions = dom.div(undefined, "modal-actions")

    var url = dom.inputText(undefined, "Paste URL Here", "fullwidth")
    url.addEventListener("keyup", () => {
        var code = embed.getCodeFromUrl(url.value)
        if(code) {
            insert.classList.remove("button-disabled")
            preview.innerHTML = code
        } else {
            insert.classList.add("button-disabled")
            preview.innerHTML = "<div>Sorry, this service doesn't seem to be supported yet. Make sure the URL is correct.</div>"
        }
    })

    var preview = dom.div()

    var cancel = dom.button(undefined, "Cancel", () => {
        url.value = ""
        modal.hide()
    })
    var insert = dom.button(undefined, "Insert", () => {
        if(embed.getCodeFromUrl(url.value)) {
            modal.hide()
            insertCb(`![Video](${ url.value })`)
        }
    }, "button-disabled")

    modalActions.appendChild(cancel)
    modalActions.appendChild(insert)

    modal.modal.appendChild(url)
    modal.modal.appendChild(preview)
    modal.modal.appendChild(modalActions)

    return modal
}

module.exports = createEmbedModal
