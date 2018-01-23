"use strict"

const dom = require('../../dom.js')
const theme = require('../../theme.js')

var tipsLabelId = 0

function createSettingsModal() {
    var el = dom.modal("Settings", true) // remove on close

    // THEME
    var themeSection = dom.div()

    var selectTheme = dom.element("select")
    for(var themeName in theme.themes) {
        var option = dom.element("option", theme.themes[themeName])
        option.value = themeName
        if(themeName === theme.getTheme()) option.selected = true
        selectTheme.appendChild(option)
    }
    selectTheme.addEventListener("change", () => {
        console.log(selectTheme.value);
        theme.changeTheme(selectTheme.value)
    })

    themeSection.appendChild(dom.h3("Theme"))
    themeSection.appendChild(selectTheme)

    var tipsSection = dom.div()
    var tipsCheckbox = dom.element("input")
    tipsCheckbox.type = "checkbox"
    tipsCheckbox.id = `tipslabel-${ tipsLabelId ++ }`
    var tipsLabel = dom.element("label", "Show tips on the welcome screen")
    tipsLabel.htmlFor = tipsCheckbox.id
    tipsCheckbox.checked = localStorage["openworldcrafter.preferences.hidetips"] !== "true"

    tipsCheckbox.addEventListener("change", () => {
        localStorage["openworldcrafter.preferences.hidetips"] = tipsCheckbox.checked ? "false" : "true"
    })

    tipsSection.appendChild(dom.h3("Tips"))
    tipsSection.appendChild(tipsCheckbox)
    tipsSection.appendChild(tipsLabel)

    el.appendChild(themeSection)
    el.appendChild(tipsSection)

    return el
}

function addOkButton(modal) {
    var modalActions = dom.div(undefined, "modal-actions")
    modalActions.appendChild(dom.button(undefined, "Ok", () => {
        modal.hide()
    }))
    modal.appendChild(modalActions)
}

module.exports.createSettingsModal = function() {
    var modal = createSettingsModal()
    addOkButton(modal)
    return modal
}
