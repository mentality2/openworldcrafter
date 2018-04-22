"use strict"

const dom = require('../dom.js')
const webrequest = require('../api/webrequest')

const noop = () => {}

function createDeviceNameModal(el, password) {
    var name = dom.inputText($owf.deviceType, "Device Name")
    el.appendChild(name)

    var actions = dom.div(undefined, "modal-actions")
    var cancel = dom.button(undefined, "Cancel", () => { el.hide() })
    var login = dom.button(undefined, "Add Device", () => {
        webrequest.postForm("/api/auth/devices", {
            name: name.value,
            password
        }, (err, data) => {
            if(err) {
                console.log("result", err)
                $owf.handleError("Error", "The device could not be added.", err)
            } else {
                var credentials = JSON.parse(data).credentials
                localStorage.setItem("openworldcrafter.device.name", credentials.name)
                localStorage.setItem("openworldcrafter.device.uuid", credentials.id)
                localStorage.setItem("openworldcrafter.device.token", credentials.token)

                el.hide()
            }
        })
    })

    actions.appendChild(cancel)
    actions.appendChild(login)
    el.appendChild(actions)
}

module.exports.createDeviceLoginModal = function() {
    var el = dom.modal("Login", true)

    var email = dom.inputText("", "Email")
    var password = dom.inputText("", "Password")
    password.type = "password"

    if(process.env.NODE_ENV === "development") {
        // because I'm too lazy to type it every time
        email.value = "glados@aperturelabs.com"
        password.value = "wheatleyisverydumb1"
    }

    var actions = dom.div(undefined, "modal-actions")
    var cancel = dom.button(undefined, "Cancel", () => { el.hide() })
    var login = dom.button(undefined, "Login", () => {
        webrequest.postForm("/api/auth/login/password", {
            email: email.value, password: password.value
        }, (err) => {
            if(err) {
                el.hide()
                $owf.handleError("Error", err.err)
                return
            }

            email.remove(); password.remove(); actions.remove()
            createDeviceNameModal(el, password.value)
        })
    })

    actions.appendChild(cancel)
    actions.appendChild(login)

    el.appendChild(email)
    el.appendChild(password)
    el.appendChild(actions)

    return el
}
