"use strict"

const dom = require('../dom.js')
const project = require('../project')
const electron = require('electron')
const diskApi = require('../api/disk')

function createProject(name, description) {
    var serial = JSON.parse(JSON.stringify(require("../project/default.json")))
    serial.info = {
        name, description, authors: []
    }
    var proj = new project.Project(serial)
    return proj
}

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
    var createDrive = dom.button("", "Save", () => {
        newProjectModal.wrapper.classList.remove("modal-visible")

        electron.remote.dialog.showSaveDialog({
            title: "Save Project",
            defaultPath: name.value + ".owf"
        }, filename => {
            var proj = createProject(name.value, desc.value)
            proj.$store = new diskApi(filename, proj, () => {
                proj.save()
                $owf.addRecentProject(name.value, filename, desc.value)
                $owf.viewProject(proj)
            })
        })
    })
    actionBar.appendChild(createDrive)

    newProjectModal.modal.appendChild(actionBar)

    return newProjectModal
}

module.exports.remakeTestProject = function() {
    var name = "TEST PROJECT"
    var desc = "Transient project for testing purposes. Click 'Remake test.owf' on the welcome page to reset this project. You must be in dev mode to do this."

    var proj = createProject(name, desc)
    proj.$store = new diskApi("test.owf", proj, () => {
        proj.save()
        $owf.addRecentProject(name, "test.owf", desc)
        $owf.viewProject(proj)
    })
}
