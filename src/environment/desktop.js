"use strict"

const electron = $native.electron
const path = $native.path
const disk = require("../api/disk.js")
const web = require('../api/api.js')
const https = $native.https
const project = require('../project')
const dom = require('../dom')
const magicuuids = require('../magicuuids')
const utils = require('../utils.js')

const theme = require('../theme.js')
theme.setTheme()

class DesktopEnvironment extends require("./index") {
    constructor() {
        super()

        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "webview"
        this.showLogoInCorner = true

        this.availableAPIs = {
            disk: disk.DiskApiDescription
        }

        web.getOnlineApi(api => {
            if(api) this.availableAPIs.web = api

            this._onFinishLoad()
        })
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

        require("../editor")(document.body, project)
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
        https.get('https://raw.githubusercontent.com/openworldcrafter/openworldcrafter/master/package.json', (res) => {
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
        var desc = "Transient project for testing purposes. Click 'Remake test.owc' on the welcome page to reset this project. You must be in dev mode to do this."

        var proj = project.createProject(name, desc, magicuuids.test_project)
        proj.$store = new disk("test.owc", proj, () => {
            // this is bad code. we really shouldn't be accessing _projectList
            // directly but ¯\_(ツ)_/¯
            disk.DiskApiDescription._projectList.addProjectEntry(name, "test.owc", desc, () => {})

            proj.save(true, () => {
                utils.launchEditor("test.owc", "disk")
            })
        })
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
