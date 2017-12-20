"use strict"

const electron = require('electron')
const path = require('path')
const disk = require("../api/disk.js")
const https = require('https')
const project = require('../project')
const dom = require('../dom')
const magicuuids = require('../magicuuids')

class DesktopEnvironment extends require("./index") {
    constructor() {
        super()

        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "webview"
        this.styleDir = path.join(__dirname, "../styles/css/")
        this.showLogoInCorner = true

        this.availableAPIs = [disk.DiskApiDescription]
    }

    getProjectList(cb) {
        console.trace("[DEPRECATION] Use api.getProjectList() instead")
        this.availableAPIs[0].getProjectList(cb)
    }

    getSaveMethods() {
        console.trace("[DEPRECATION] Use this.availableAPIs instead")
        return this.availableAPIs
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

    handleError(title, error, debug) {
        // TODO: Modal error message
        if(!this._desktop_error_modal) {
            var modal = dom.modal("")
            modal.id = "desktop-error-modal"

            var text = dom.div()
            text.id = "desktop-error-modal-text"

            var actions = dom.div(undefined, "modal-actions")
            var ok = dom.button(undefined, "Ok", () => {
                modal.hide()
            })
            actions.appendChild(ok)

            modal.modal.appendChild(text)
            modal.modal.appendChild(actions)

            modal.addToContainer()

            this._desktop_error_modal = modal
            this._desktop_error_modal_text = text
        } else var modal = this._desktop_error_modal

        this._desktop_error_modal_text.textContent = error
        modal.setTitle(title)
        modal.show()

        console.log("Error!", title, error, debug)
    }

    /** DESKTOP SPECIFIC STUFF **/

    checkUpdate(cb) {
        https.get('https://raw.githubusercontent.com/openworldfactory/openworldfactory/master/package.json', (res) => {
            if(res.statusCode !== 200) {
                console.log("Cannot check for updates; fetching package.json returned " + res.statusCode)
                res.resume()
                return
            }

            res.setEncoding('utf8')
            let rawData = ''
            res.on('data', chunk => rawData += chunk)
            res.on('end', () => {
                try {
                    cb(JSON.parse(rawData))
                } catch (e) {
                    console.log("Cannot check for updates", e.message)
                }
            })
        }).on('error', e => {
            console.error("Cannot check for updates", e.message)
        })
    }

    remakeTestProject() {
        var name = "TEST PROJECT"
        var desc = "Transient project for testing purposes. Click 'Remake test.owf' on the welcome page to reset this project. You must be in dev mode to do this."

        var proj = project.createProject(name, desc, magicuuids.test_project)
        proj.$store = new disk("test.owf", proj, () => {
            proj.save()
            this.viewProject(proj)
        })
    }

    showOpenDialog() {
        try {
            electron.remote.dialog.showOpenDialog({
                title: "Open Project",
                properties: ["openFile"]
            }, filenames => {
                this.openProject(filenames[0], err => {
                    this.handleError("Error Opening Project", err)
                })
            })
        } catch(e) {
            this.handleError("Error Opening Project", e)
        }
    }
}

global.$owf = new DesktopEnvironment()
