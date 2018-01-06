"use strict"

const dom = require('../../dom.js')
const theme = require('../../theme.js')

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

    el.appendChild(themeSection)

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
module.exports.createAppSettingsModal = function() {
    var modal = createSettingsModal()
    require("./app.js").createAppSettingsModal(modal)
    addOkButton(modal)
    return modal
}
