"use strict"

const dom = require('./dom.js')

const themeNames = {
    theme_dark: "Dark Theme",
    theme_light: "Light Theme"
}

const themes = {
    theme_dark: "theme_dark.css",
    theme_light: "theme_light.css"
}

const statusbar = {
    theme_dark: "#ccc",
    theme_light: "#333"
}

function setTheme(name) {
    if(name) {
        // use given theme
        changeTheme(name)
    } else {
        // use default theme in localstorage, or default
        changeTheme(localStorage["openworldcrafter.preferences.theme"] || "theme_light")
    }
}

function reload() {
    if(document.getElementById("mainStylesheet")) {
        document.getElementById("mainStylesheet").href = document.getElementById("mainStylesheet").href + "a"
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

    // ?rl=a is so that the stylesheet can easily be reloaded by adding a char to the url
    if(themes[name]) document.getElementById("mainStylesheet").href = $owf.styleDir + themes[name] + "?rl=a"

    // if StatusBar is defined, use it to set the status bar to the foreground color
    if(typeof StatusBar !== "undefined") {
        StatusBar.backgroundColorByHexString(statusbar[name] || statusbar.theme_light)
    }

    // set preference
    localStorage["openworldcrafter.preferences.theme"] = name
}

function getTheme() {
    return localStorage["openworldcrafter.preferences.theme"]
}

module.exports = {
    setTheme, changeTheme, reload, themes: themeNames, getTheme
}
