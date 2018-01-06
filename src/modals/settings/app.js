"use strict"

const dom = require('../../dom')
const adRevenueWarning = `Revenue from ads on the Welcome screen let me spend
more time and resources on making openworldfactory better. Removing ads does not
cost anything, but will cause me to shed a single tear. Are you sure you want to
do this?`
const adsEnabled = `Thanks! Ads have been enabled. You may need to restart the app for
this to take effect.`

function createAdsEnabledModal() {
    var el = dom.modal("Ads Enabled", true) // remove on close

    el.appendChild(dom.div(adsEnabled))

    var modalActions = dom.div(undefined, "modal-actions")
    modalActions.appendChild(dom.button(undefined, "Ok", () => {
        el.hide()
    }))
    el.appendChild(modalActions)

    return el
}

function createDisableAdsModal(cb) {
    var el = dom.modal("Disable Advertisements", true) // remove on close

    el.appendChild(dom.div(adRevenueWarning))

    var modalActions = dom.div(undefined, "modal-actions")
    modalActions.appendChild(dom.button(undefined, "Cancel", () => {
        el.hide()
        cb()
    }))
    modalActions.appendChild(dom.button(undefined, "Disable Ads", () => {
        localStorage["openworldfactory.disableadvertisements"] = "true"
        if(window.$advertisements) window.$advertisements.hide()
        el.hide()
        cb()
    }, "button-dangerous"))
    el.appendChild(modalActions)

    return el
}

function createAppSettingsModal(modal) {
    // ADVERTISEMENTS
    var adsSection = dom.div()

    var adsButton = dom.button(undefined, undefined, () => {
        if(localStorage["openworldfactory.disableadvertisements"]) {
            delete localStorage["openworldfactory.disableadvertisements"]
            var modal = createAdsEnabledModal()
            labelAdsButton()
        } else {
            var modal = createDisableAdsModal(labelAdsButton)
        }

        modal.show()
    })
    function labelAdsButton() {
        if(localStorage["openworldfactory.disableadvertisements"]) {
            adsButton.textContent = "Enable Ads"
        } else {
            adsButton.textContent = "Disable Ads"
        }
    }
    labelAdsButton()

    adsSection.appendChild(dom.h3("Advertisements"))
    adsSection.appendChild(adsButton)
    modal.appendChild(adsSection)

    return modal
}

module.exports.createAppSettingsModal = createAppSettingsModal
