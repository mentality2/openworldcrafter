"use strict"

const electron = require('electron')
const path = require('path')
const url = require('url')
const yargs = require('yargs')

const args = yargs.argv

var win

electron.ipcMain.on("openWindow", (event, arg) => {
    createWindow(arg)
})

function createWindow(page) {
    win = new electron.BrowserWindow({
        show: false,
        width: 1000,
        height: 675,
        webPreferences: {
            // disable devtools except in dev environments
            devTools: process.env.NODE_ENV === "development",
            preload: path.join(__dirname, "environment", "desktop.js")
        }
    })

    // keep the menu in dev mode so devtools works
    if(process.env.NODE_ENV !== "development") win.setMenu(null)

    win.loadURL(url.format({
        pathname: page.split("?")[0],
        search: page.split("?").length === 2 ? page.split("?")[1] : undefined,
        protocol: "file:",
        slashes: true
    }))

    win.webContents.on("will-prevent-unload", e => {
        var choice = electron.dialog.showMessageBox({
            title: "Confirm Exit",
            type: "question",
            buttons: ["Stay", "Close"],
            message: "Changes won't be saved! Are you sure you want to close?"
        })

        if(choice == 1) {
            // call preventDefault if they want to close
            e.preventDefault()
        }
    })

    win.on("ready-to-show", () => win.show())

    win.on("closed", () => {
        win = null
    })
}

// open file handler for macos
electron.app.on("open-file", (event, path) => {
    createWindow(path.join(__dirname, "editor", "editor.htm") + "?file=" + encodeURIComponent(file))
})

electron.app.on("ready", () => {
    if(args._.length && false) {
        for(var file of args._) {
            createWindow(path.join(__dirname, "editor", "editor.htm") + "?file=" + encodeURIComponent(file))
        }
    } else {
        createWindow(path.join(__dirname, "welcome", "welcome.htm"))
    }
})

electron.app.on("window-all-closed", () => {
    electron.app.quit()
})
