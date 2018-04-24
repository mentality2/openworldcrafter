"use strict"

const dom = require('../../dom.js')
const tabarea = require('../../tabs')
const theme = require('../../theme.js')

function createSettingsModal() {
    var modal = dom.modal("Settings", true) // remove on close

    var tabs = []

    tabs.push(require("./general.js")())
    if($owf.availableAPIs.web) tabs.push(require("./account.js")())

    if(tabs.length === 1) {
        modal.appendChild(tabs[0].el)
    } else {
        var tabArea = new tabarea.TabArea(modal.modal)

        for(var tab of tabs) {
            tabArea.addTab(tab.name, tab.el)
        }
    }

    var modalActions = dom.div(undefined, "modal-actions")
    modalActions.appendChild(dom.button(undefined, "Ok", () => {
        modal.hide()
    }))
    modal.appendChild(modalActions)

    return modal
}
module.exports.createSettingsModal = createSettingsModal
