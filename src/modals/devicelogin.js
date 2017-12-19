"use strict"

const dom = require('../dom.js')
const webrequest = require('../api/webrequest')

const noop = () => {}

function createDeviceNameModal(el) {
    var name = dom.inputText($owf.deviceType, "Device Name")
    el.modal.appendChild(name)

    var actions = dom.div(undefined, "modal-actions")
    var cancel = dom.button(undefined, "Cancel", () => { el.hide() })
    var login = dom.button(undefined, "Add Device", () => {
        webrequest.postForm("/user/settings/devices/add", {
            devicename: name.value
        }, (status, data) => {
            if(status) {
                $owf.handleError("Error", "The device could not be added.", status)
            } else {
                var credentials = JSON.parse(data)
                localstorage.setItem("openworldfactory.device.name", credentials.name)
                localstorage.setItem("openworldfactory.device.uuid", credentials.uuid)
                localstorage.setItem("openworldfactory.device.token", credentials.token)

                // now log out
                webrequest.postForm("/logout", {}, () => {
                    el.hide()
                })
            }
        })
    })
}

module.exports.createDeviceLoginModal = function() {
    var el = dom.modal("Login")

    var email = dom.inputText("", "Email")
    var password = dom.inputText("", "Password")

    var actions = dom.div(undefined, "modal-actions")
    var cancel = dom.button(undefined, "Cancel", () => { el.hide() })
    var login = dom.button(undefined, "Login", () => {
        webrequest.postForm("/login", {
            email: email.value, password: password.value
        }, () => {
            email.remove(); password.remove(); actions.remove()
            createDeviceNameModal(el)
        })
    })

    actions.appendChild(cancel)
    actions.appendChild(login)

    el.modal.appendChild(email)
    el.modal.appendChild(password)
    el.modal.appendChild(actions)

    return el
}
