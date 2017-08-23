"use strict"

const dom = require('./dom.js')

const themes = {
    theme_dark: "theme_dark.css",
    theme_light: "theme_light.css"
}

function setTheme(name) {
    if(name) {
        // use given theme
        changeTheme(name)
    } else {
        // use default theme in localstorage, or default
        changeTheme(localStorage["openworldfactory.preferences.theme"] || "theme_dark")
    }
}

function changeTheme(name) {
    if(!themes[name]) return

    if(!document.getElementById("mainStylesheet")) {
        var link = dom.element("link")
        link.rel = "stylesheet"
        link.href = $owf.styleDir + themes[name]
        link.id = "mainStylesheet"
        document.head.appendChild(link)
    }

    if(themes[name]) document.getElementById("mainStylesheet").href = $owf.styleDir + themes[name]

    // set preference
    localStorage["openworldfactory.preferences.theme"] = name
}

module.exports = {
    setTheme, changeTheme
}
