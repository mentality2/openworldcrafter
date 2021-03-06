"use strict"

const api = require('../api/app')
const web = require('../api/web.js')
const dom = require('../dom')
const project = require('../project')
const magicuuids = require('../magicuuids')
const settings = require('../modals/settings')
const utils = require('../utils.js')

class AppEnvironment extends require("./index") {
    constructor() {
        super()

        this.mobile = true

        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "iframe"

        this.buildType = "app"

        this.availableAPIs = {
            app: api
        }

        web.checkAvailability(available => {
            if(available) this.availableAPIs.web = new web()

            this._onFinishLoad()
        })
    }

    getProjectList(cb) {
        console.trace("[DEPRECATION] Use api.apiDescription.projectList instead")
        this.availableAPIs[0].getProjectList(cb)
    }

    getSaveMethods() {
        console.trace("[DEPRECATION] Use $owf.availableAPIs instead")
        return this.availableAPIs
    }

    showWelcome() {
        utils.goToPage("welcome.htm")
    }

    /*
        Open a new window with a documentation page
    */
    showDocs(page) {
        // _blank is still required so that the project isn't unloaded
        cordova.InAppBrowser.open("../resources/docs/index.htm#" + page, "_blank", "zoom=no")
    }

    /*
        Display the license file
    */
    showLicense() {
        cordova.InAppBrowser.open("../resources/docs/license.htm", "_blank", "zoom=no")
    }

    /*
        View a webpage, as when an external link is clicked
    */
    showWebpage(url) {
        cordova.InAppBrowser.open(url, "_blank", "zoom=no")
    }

    showSettings() {
        var settingsModal = settings.createSettingsModal()
        settingsModal.show()
    }

    handleError(title, message, debug) {
        navigator.notification.alert(message, () => {}, title)
        console.log("Error", title, message, debug)
    }

    /*
        Show the 'Are you sure you want to exit?' modal
    */
    showExitConfirmation() {
        var res = confirm("Changes won't be saved! Are you sure you want to close?") ? undefined : true
        return res
    }

    remakeTestProject() {
        var name = "TEST PROJECT"
        var desc = "Transient project for testing purposes. Click 'Remake test.owc' on the welcome page to reset this project. You must be in dev mode to do this."

        this.availableAPIs.app.createProject(name, desc, magicuuids.test_project)
    }
}

global.$owf = new AppEnvironment()
