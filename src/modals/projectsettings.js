"use strict"

const dom = require('../dom.js')

const noop = () => {}

function createProjectSettingsModal(project, ref) {
    var el = dom.modal(`${project.info.name} \u25B6 Project Info`)

    var nameEdit = dom.inputText(project.info.name, undefined, ["edit-visible", "fullwidth"])
    nameEdit.addEventListener("input", () => {
        el.setTitle(`${nameEdit.value} \u25B6 Project Info`)
    })
    el.appendChild(nameEdit)

    var desc = dom.div(project.info.description, "edit-invisible")
    var descEdit = dom.element("textarea", project.info.description, ["edit-visible", "textarea-fullwidth"])
    el.appendChild(desc)
    el.appendChild(descEdit)

    if(project.$store.getLocationString()) {
        el.appendChild(dom.div(project.$store.getLocationString(), "edit-invisible"))
    }

    if(project.isEditable()) {
        var actions = dom.div(null, "modal-actions")

        var edit = dom.button("edit", "Edit", () => {
            el.wrapper.classList.add("editing")
        }, "edit-invisible")
        var cancel = dom.button(null, "Cancel", () => {
            // Reset changes and close dialog
            el.hide()
            resetFields()
        }, "edit-visible")
        var apply = dom.button(null, "Apply", () => {
            // Apply changes but don't close dialog
            applyChanges()
            el.wrapper.classList.remove("editing")
        }, "edit-visible")
        var ok = dom.button(null, "OK", () => {
            // Apply changes and close dialog
            applyChanges()
            el.hide()
            el.wrapper.classList.remove("editing")
        }, "edit-visible")

        actions.appendChild(edit)
        actions.appendChild(cancel)
        actions.appendChild(apply)
        actions.appendChild(ok)

        el.appendChild(actions)
    }

    function resetFields() {
        nameEdit.value = project.info.name
        descEdit.value = project.info.description
        el.setTitle(`${nameEdit.value} \u25B6 Project Info`)
    }

    function applyChanges() {
        if(nameEdit.value) {
            project.info.name = nameEdit.value
        }
        desc.textContent = project.info.description = descEdit.value

        ref.changeProjectName()
        project.save(true)
    }

    return el
}

module.exports = {
    createProjectSettingsModal
}
