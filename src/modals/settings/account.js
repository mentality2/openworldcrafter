"use strict"

const dom = require('../../dom.js')
const webrequest = require('../../api/webrequest.js')

function removeDeviceModal(device, cb) {
    var modal = dom.modal("Remove " + device.name, true, 1)

    var error = dom.message("", true)
    modal.appendChild(error.el)

    var deviceword1 = device.isthis ? "this" : "a"
    var deviceword2 = device.isthis ? "this" : "that"
    modal.appendChild(dom.div(`You are about to remove ${deviceword1} device
        from your account. If you want to use ${deviceword2} device with your
        account again, you will need to log in again. Projects downloaded to
        ${deviceword2} device will not be removed. No data will be lost.`))
    modal.appendChild(dom.div(`Enter your password to continue.`))

    var password = dom.inputText("", "Password")
    password.type = "password"
    modal.appendChild(password)

    var actions = dom.div("", "modal-actions")
    var spinner = dom.span("", ["spinning-wheel-of-death", "invisible"])
    var cancel = dom.button("", "Cancel", () => {
        modal.hide()
    })
    var del = dom.button("delete", "Delete", () => {
        dom.show(spinner)
        webrequest.postForm("/api/auth/devices/" + device.id + "/delete", {
            password: password.value
        }, (err, data) => {
            dom.hide(spinner)
            if(err) {
                error.setMessage("Password is incorrect")
                return
            }

            if(device.isthis) delete $owf.availableAPIs.web

            modal.hide()
            cb()
        })
    }, "button-dangerous")
    actions.appendChild(spinner)
    actions.appendChild(cancel)
    actions.appendChild(del)
    modal.appendChild(actions)

    modal.show()
}

module.exports = function() {
    var el = dom.div()

    var error = dom.message("", true)
    el.appendChild(error.el)

    var accountName = dom.div("", "invisible")
    el.appendChild(accountName)

    var security = dom.div("", "invisible")
    el.appendChild(security)

    var deviceList = dom.div("", "invisible")
    el.appendChild(deviceList)

    // var sessionList = dom.div()
    // el.appendChild(sessionList)

    webrequest.getTextResource("/api/user", (err, data) => {
        if(err) {
            error.setMessage("Could not access account settings")
            return
        }

        var account = JSON.parse(data).user
        accountName.textContent = `Logged in as ${ account.name } (${ account.email })`

        dom.removeAllChildren(security)
        dom.show(security)
        security.appendChild(dom.h3("Security"))
        security.appendChild(dom.div(`Your password was last changed ${ new Date(account.authupdated).toDateString() }.`))
    })

    function getDevices() {
        var validDevices = 0
        webrequest.getTextResource("/api/auth/devices", (err, data) => {
            if(err) {
                error.setMessage("Could not access account settings")
                return
            }

            dom.removeAllChildren(deviceList)
            dom.show(deviceList)
            deviceList.appendChild(dom.h3("Devices"))

            var table = dom.table(["Name", "Last Seen", ""])
            table.classList.add("fullwidth")

            var devices = JSON.parse(data).devices
            for(let dev of devices) {
                // for now, only show valid devices. this may change later.
                if(dev.status !== "valid") continue

                validDevices ++

                var tr = dom.tr([dev.name, new Date(dev.lastseen).toDateString()])
                if(dev.isthis) tr.classList.add("bold")
                if(dev.status === "valid") {
                    tr.appendChild(dom.button("delete", "", () => {
                        removeDeviceModal(dev, () => {
                            getDevices()
                        })
                    }))
                }
                table.appendChild(tr)
            }

            if(validDevices) deviceList.appendChild(table)
            else deviceList.appendChild(dom.div("No devices are authorized to access your account."))
        })
    }

    // function getSessions() {
    //     webrequest.getTextResource("/api/auth/sessions", (err, data) => {
    //         dom.removeAllChildren(sessionList)
    //         sessionList.appendChild(dom.h3("Sessions"))
    //
    //         var table = dom.table(["Name", "Last Seen", "Status", ""])
    //         sessionList.appendChild(table)
    //
    //         var sessions = JSON.parse(data).sessions
    //         for(let session of sessions) {
    //             // for now, don't show expired sessions
    //             if(dev.status !== "valid") continue
    //
    //             var tr = dom.tr([dev.name, new Date(dev.lastseen).toDateString(), dev.status])
    //             if(dev.isthis) tr.classList.add("bold")
    //             if(dev.status === "valid") {
    //                 tr.appendChild(dom.button("delete", "", () => {
    //                     removeDeviceModal(dev, () => {
    //                         getDevices()
    //                     })
    //                 }))
    //             }
    //             table.appendChild(tr)
    //         }
    //     })
    // }

    getDevices()
    // getSessions()

    return { name: "Account", el }
}
