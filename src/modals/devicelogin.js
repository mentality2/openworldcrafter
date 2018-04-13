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
        webrequest.postForm("/user/settings/devices/add", {
            devicename: name.value,
            password
        }, (status, data) => {
            if(status) {
                console.log("result", status, data);
                $owf.handleError("Error", "The device could not be added.", status)
            } else {
                var credentials = JSON.parse(data)
                console.log("credentials", credentials);
                localStorage.setItem("openworldcrafter.device.name", credentials.name)
                localStorage.setItem("openworldcrafter.device.uuid", credentials.uuid)
                localStorage.setItem("openworldcrafter.device.token", credentials.token)

                // now log out
                webrequest.postForm("/logout", {}, () => {
                    el.hide()
                })
            }
        })
    })

    actions.appendChild(cancel)
    actions.appendChild(login)
    el.appendChild(actions)
}

module.exports.createDeviceLoginModal = function() {
    var el = dom.modal("Login")

    var email = dom.inputText("", "Email")
    var password = dom.inputText("", "Password")
    password.type = "password"

    if(process.env.NODE_ENV === "development") {
        // because I'm too lazy to type it every time
        email.value = "dvader@deathstar.mil"
        password.value = "luke"
    }

    var actions = dom.div(undefined, "modal-actions")
    var cancel = dom.button(undefined, "Cancel", () => { el.hide() })
    var login = dom.button(undefined, "Login", () => {
        webrequest.postForm("/login", {
            email: email.value, password: password.value
        }, () => {
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
