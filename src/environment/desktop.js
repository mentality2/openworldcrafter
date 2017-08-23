"use strict"

require("./common.js")

const electron = require('electron')
const path = require('path')
const disk = require("../api/disk.js")

function elipsize(str, len) {
    if(str.length > len) return str.substr(0, len - 1) + "\u2026"
    else return str
}

function removeRecentFile(location) {
    var recentFiles = JSON.parse(localStorage.getItem("openworldfactory.recentFiles"))
    recentFiles = recentFiles || []

    for(var i = 0; i < recentFiles.length;) {
        if(recentFiles[i].location === location) {
            recentFiles.splice(i, 1)
        } else i ++
    }

    localStorage.setItem("openworldfactory.recentFiles", JSON.stringify(recentFiles))
}

function addRecentFile(file) {
    var recentFiles = JSON.parse(localStorage.getItem("openworldfactory.recentFiles"))
    recentFiles = recentFiles || []

    for(var i = 0; i < recentFiles.length;) {
        if(recentFiles[i].location === file.location) {
            recentFiles.splice(i, 1)
        } else i ++
    }

    recentFiles.unshift(file)
    localStorage.setItem("openworldfactory.recentFiles", JSON.stringify(recentFiles))
}

class DesktopEnvironment extends require("./index") {
    constructor() {
        super()

        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "webview"
        this.styleDir = path.join(__dirname, "../styles/css/")
        this.showLogoInCorner = true
    }

    /*
        Takes a project file location as a parameter, loads the project, and then
        calls viewProject
    */
    openProject(location, onerr) {
        if(typeof location === "string") {
            var diskapi = new disk(location, null, proj => {
                this.addRecentProject(proj.info.name, location, proj.info.description)
                $owf.viewProject(proj)
            }, err => {
                console.log(err)
                removeRecentFile(location)
                onerr(err)
            })
        }
    }

    /*
        Takes a project object as a parameter and builds an editor for it in the
        current webpage.
    */
    viewProject(project) {
        this.project = project

        document.body.innerHTML = ""
        require("../editor")(document.body, project)
    }

    addRecentProject(name, location, desc) {
        addRecentFile({
            name,
            location,
            desc: elipsize(desc, 200)
        })
    }

    /*
        Open a new window with a documentation page
    */
    showDocs(page) {
        electron.ipcRenderer.send("openWindow", path.join(__dirname, "..", "docviewer", "docviewer.htm") + "?docPage=" + encodeURIComponent(page))
    }

    /*
        Open a new window with the welcome page
    */
    showWelcome() {
        electron.ipcRenderer.send("openWindow", path.join(__dirname, "..", "welcome", "welcome.htm"))
    }

    /*
        View a webpage, as when an external link is clicked
    */
    showWebpage(url) {
        electron.shell.openExternal(url)
    }

    /*
        Show the 'Are you sure you want to exit?' modal. Doesn't actually work.
    */
    showExitConfirmation() {
        return true
    }
}

global.$owf = new DesktopEnvironment()
