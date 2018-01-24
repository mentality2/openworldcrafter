"use strict"

const electron = require('electron')
const path = require('path')
const url = require('url')

var win

electron.ipcMain.on("openWindow", (event, arg) => {
    createWindow(arg)
})

function createWindow(page, preload) {
    win = new electron.BrowserWindow({
        show: false,
        width: 1000,
        height: 675,

        // prevent opening on secondary display in dev mode because that is annoying.
        x: 0, y: 0,

        webPreferences: {
            // disable devtools except in dev environments
            devTools: process.env.NODE_ENV === "development",
        }
    })

    // keep the menu in dev mode so devtools works
    if(process.env.NODE_ENV !== "development") win.setMenu(null)

    win.loadURL(url.format(new url.URL(path.join(__dirname, page), "file:///")))

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
// i have no idea if this works so i'm going to comment it out for now
// electron.app.on("open-file", (event, path) => {
//     createWindow(path.join(__dirname, "editor", "editor.htm") + "?file=" + encodeURIComponent(file))
// })

electron.app.on("ready", () => {
    // createWindow(path.join(__dirname, "index.htm"), true)
    createWindow("../pages/welcome.htm", true)

    // if(args._.length) {
    //     for(var file of args._) {
    //         createWindow(path.join(__dirname, "editor", "editor.htm") + "?file=" + encodeURIComponent(file))
    //     }
    // } else {
    // }
})

electron.app.on("window-all-closed", () => {
    electron.app.quit()
})
