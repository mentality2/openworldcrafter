"use strict"

const dom = require('../dom')

function createDeleteProjectModal(api, projectLocation, projectName, cb) {
    var el = dom.modal("Delete Project", true)

    var warning = dom.div()
    warning.appendChild(dom.span("You are about to delete a project. "))
    warning.appendChild(dom.span("This cannot be undone. ", "bold"))
    warning.appendChild(dom.span("Retype the name of the project to continue."))

    var name = dom.inputText("", "Project Name")
    name.addEventListener("input", ev => {
        if(name.value === projectName) del.classList.remove("button-disabled")
        else del.classList.add("button-disabled")
    })

    var actions = dom.div(undefined, "modal-actions")
    var cancel = dom.button(undefined, "Cancel", () => {
        el.hide()
    })
    var del = dom.button("delete", "Delete", () => {
        if(name.value === projectName) {
            api.deleteProject(projectLocation, name.value, then => {
                el.hide()
                cb()
            })
        }
    }, ["button-dangerous", "button-disabled"])
    actions.appendChild(cancel)
    actions.appendChild(del)

    el.appendChild(warning)
    el.appendChild(name)
    el.appendChild(actions)

    return el
}

module.exports = createDeleteProjectModal
