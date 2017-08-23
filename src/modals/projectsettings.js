"use strict"

const dom = require('../dom.js')

const noop = () => {}

function createProjectSettingsModal(project, ref) {
    var el = dom.modal("Project Info")

    var nameBar = dom.div()
    nameBar.appendChild(dom.span("Name: "))
    var name = dom.span(project.info.name, "edit-invisible")
    var nameEdit = dom.inputText(project.info.name, undefined, ["edit-visible", "inline"])
    nameBar.appendChild(name)
    nameBar.appendChild(nameEdit)
    el.modal.appendChild(nameBar)

    el.modal.appendChild(dom.span("Description: "))

    var desc = dom.div(project.info.description, "edit-invisible")
    var descEdit = dom.element("textarea", project.info.description, ["edit-visible", "textarea-fullwidth"])
    el.modal.appendChild(desc)
    el.modal.appendChild(descEdit)

    if(project.isEditable()) {
        var actions = dom.div(null, "modal-actions")

        var edit = dom.button("edit", "Edit", () => {
            el.modal.classList.add("editing")
        }, "edit-invisible")
        var cancel = dom.button(null, "Cancel", () => {
            // Reset changes and close dialog
            el.hide()
            resetFields()
        }, "edit-visible")
        var apply = dom.button(null, "Apply", () => {
            // Apply changes but don't close dialog
            applyChanges()
            el.modal.classList.remove("editing")
        }, "edit-visible")
        var ok = dom.button(null, "OK", () => {
            // Apply changes and close dialog
            applyChanges()
            el.hide()
            el.modal.classList.remove("editing")
        }, "edit-visible")

        actions.appendChild(edit)
        actions.appendChild(cancel)
        actions.appendChild(apply)
        actions.appendChild(ok)

        el.modal.appendChild(actions)
    }

    function resetFields() {
        name.value = project.info.name
        desc.value = project.info.description
    }

    function applyChanges() {
        if(nameEdit.value) {
            name.textContent = project.info.name = nameEdit.value
            ref.changeProjectName()
        }
        desc.textContent = project.info.description = descEdit.value

        project.save(true)
    }

    return el
}

module.exports = {
    createProjectSettingsModal
}
