"use strict"

const dom = require('../dom')

function updateList(project, list) {
    project.$store.getSharingSettings(settings => {
        for(var perm of settings.permissions) {
            list.appendChild(dom.div(perm.displayname))
        }
    })
}

function createInviteModal(project, list) {
    var el = dom.modal("Invite")

    var email = dom.inputText("", "Email Address")
    email.type = "email"
    el.modal.appendChild(email)

    var message = dom.element("textarea")
    message.placeholder = "Message (optional)"
    el.modal.appendChild(message)

    var actions = dom.div(null, "modal-actions")
    var close = dom.button(null, "Cancel", () => {
        el.hide()
    })
    var invite = dom.button(null, "Invite", () => {
        project.$store.invite(email.value, message.value, () => {
            updateList(project, list)
            el.hide()
        })
    })
    actions.appendChild(invite)
    actions.appendChild(close)
    el.modal.appendChild(actions)

    return el
}

function createSharingModal(project, inviteModal) {
    if(!project.$store.getSharingSettings) {
        var el = dom.modal("Sharing")
        el.modal.appendChild(dom.div("Sharing is not enabled for this project."))
        var actions = dom.div(null, "modal-actions")
        var close = dom.button(null, "Cancel", () => {
            el.hide()
        })
        el.modal.appendChild(actions)
        return el
    }

    var el = dom.modal("Sharing")

    var list = dom.div()
    el.modal.appendChild(list)
    updateList(project, list)

    var actions = dom.div(null, "modal-actions")
    var invite = dom.button(null, "Invite…", () => {
        inviteModal.show()
    })
    actions.appendChild(invite)
    var close = dom.button(null, "Close", () => {
        el.hide()
    })
    actions.appendChild(close)

    el.modal.appendChild(actions)

    var inviteModal = createInviteModal(project, list)
    el.inviteModal = inviteModal

    return el
}

module.exports = {
    createSharingModal, createInviteModal
}
