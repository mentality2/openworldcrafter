"use strict"

const api = require('../api/app')
const dom = require('../dom')
const fs = require('../api/fileplugin')
const project = require('../project')
const magicuuids = require('../magicuuids')

class AppEnvironment extends require("./index") {
    constructor() {
        super()

        this.mobile = true

        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "iframe"
        this.styleDir = "res/styles/"

        this.availableAPIs = [api.AppApiDescription]
    }

    getProjectList(cb) {
        console.trace("[DEPRECATION] Use api.apiDescription.projectList instead")
        this.availableAPIs[0].getProjectList(cb)
    }

    getSaveMethods() {
        console.trace("[DEPRECATION] Use $owf.availableAPIs instead")
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

    showWelcome() {
        document.body.innerHTML = ""
        this.loadWelcome()
    }

    /*
        Open a new window with a documentation page
    */
    showDocs(page) {
        // _blank is still required so that the project isn't unloaded
        cordova.InAppBrowser.open("res/docs/" + page.replace(/\.md$/, ".htm"), "_blank", "zoom=no")
    }

    /*
        View a webpage, as when an external link is clicked
    */
    showWebpage(url) {
        cordova.InAppBrowser.open(url, "_blank")
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
        var desc = "Transient project for testing purposes. Click 'Remake test.owf' on the welcome page to reset this project. You must be in dev mode to do this."

        this.availableAPIs[0].createProject(name, desc, magicuuids.test_project)
    }
}

global.$owf = new AppEnvironment()
