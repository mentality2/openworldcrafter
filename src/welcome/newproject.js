"use strict"

const dom = require('../dom.js')
const project = require('../project')
const utils = require('../utils.js')

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

    var boringButton = Object.keys($owf.availableAPIs).length === 1
    for(let methodName in $owf.availableAPIs) {
        let method = $owf.availableAPIs[methodName]
        let button = dom.button(boringButton ? undefined : method.buttonIcon, boringButton ? "Save" : method.buttonText, () => {
            newProjectModal.wrapper.classList.remove("modal-visible")
            method.createProject((err, storageAPI) => {
                if(err) $owf.handleError("Error creating project", err)
                else {
                    var proj = project.createProject(name.value, desc.value, storageAPI)
                    utils.launchEditor(storageAPI.getLocation(), method.name)
                }
            }, name.value)
        })
        actionBar.appendChild(button)
    }

    newProjectModal.modal.appendChild(actionBar)

    return newProjectModal
}
