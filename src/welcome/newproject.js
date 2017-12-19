"use strict"

const dom = require('../dom.js')
const project = require('../project')

module.exports = function() {
    // "New" Modal
    var newProjectModal = dom.modal("New Project")

    var name = dom.inputText("", "Name")
    newProjectModal.modal.appendChild(name)

    newProjectModal.modal.appendChild(dom.span("Description: "))
    var desc = dom.element("textarea", null, "textarea-fullwidth")
    newProjectModal.modal.appendChild(desc)

    var actionBar = dom.div(null, "modal-actions")

    var cancel = dom.button("", "Cancel", () => {
        newProjectModal.wrapper.classList.remove("modal-visible")
    })

    actionBar.appendChild(cancel)

    var boringButton = $owf.availableAPIs.length === 1
    for(var method of $owf.availableAPIs) {
        var button = dom.button(boringButton ? undefined : method.buttonIcon, boringButton ? "Save" : method.buttonText, () => {
            newProjectModal.wrapper.classList.remove("modal-visible")
            method.createProject(name.value, desc.value)
        })
        actionBar.appendChild(button)
    }

    newProjectModal.modal.appendChild(actionBar)

    return newProjectModal
}
