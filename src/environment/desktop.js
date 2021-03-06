"use strict"

const electron = $native.electron
const path = $native.path
const disk = require("../api/disk.js")
const web = require('../api/web.js')
const https = $native.https
const project = require('../project')
const dom = require('../dom')
const magicuuids = require('../magicuuids')
const utils = require('../utils.js')

class DesktopEnvironment extends require("./index") {
    constructor() {
        super()

        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "webview"

        this.availableAPIs = {
            disk: disk
        }

        web.checkAvailability(available => {
            if(available) this.availableAPIs.web = new web()

            this._onFinishLoad()
        })
    }

    /*
        Open a new window with a documentation page
    */
    showDocs(page) {
        electron.ipcRenderer.send("openWindow", path.join("..", "resources", "docs", "index.htm") + "#" + page)
    }

    /*
        Display the license file
    */
    showLicense() {
        electron.ipcRenderer.send("openWindow", path.join("..", "resources", "docs", "license.htm"))
    }

    /*
        Open a new window with the welcome page
    */
    showWelcome() {
        electron.ipcRenderer.send("openWindow", "../pages/welcome.htm")
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

        $placeholder.removePlaceholder()

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

            modal.appendChild(text)
            modal.appendChild(actions)

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
        https.get('https://www.openworldcrafter.com/current.json', (res) => {
            if(res.statusCode !== 200) {
                console.log("Cannot check for updates; fetching current.json returned " + res.statusCode)
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
        var desc = "Transient project for testing purposes. Click 'Remake test.owc' on the welcome page to reset this project. You must be in dev mode to do this."

        new disk.storageAPI("test.owc", (err, store) => {
            if(err) $owf.handleError("Error creating test project", err)

            var proj = project.createProject(name, desc, store, magicuuids.test_project, () => {
                utils.launchEditor("test.owc", "disk")
            })
        }, "mustCreate")
    }

    showOpenDialog() {
        try {
            electron.remote.dialog.showOpenDialog({
                title: "Open Project",
                properties: ["openFile"]
            }, filenames => {
                utils.launchEditor(filenames[0], "disk")
            })
        } catch(e) {
            this.handleError("Error Opening Project", e)
        }
    }
}

global.$owf = new DesktopEnvironment()
