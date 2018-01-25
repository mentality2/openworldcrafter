"use strict"

const settings = require('../modals/settings')

// Prevent changing URL by drag and drop
window.addEventListener("dragover", e => {
    if(e) e.preventDefault()
}, false)
window.addEventListener("drop", e => {
    if(e) e.preventDefault()
}, false)

class Environment {
    constructor() {
        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "iframe"
    }

    _onFinishLoad() {
        if(this._finishLoadListener) this._finishLoadListener()
        else this._finishedLoading = true
    }

    onFinishLoad(func) {
        if(this._finishedLoading) func()
        else this._finishLoadListener = func
    }

    /*
        Called to make the welcome screen for the first time. Should not be used
        to return to the welcome screen after it has been closed.
    */
    loadWelcome() {
        require("../welcome")(document.body)
    }

    /*
        Gets a ProjectList instance to manage the list of projects on the
        welcome screen.
    */
    getProjectList(cb) {
        throw "Not Implemented: getProjectList"
    }

    /*
        Gets all projects from all available APIs, sorted ascending by last access date.
    */
    aggregateProjectLists(cb) {
        var lists = []
        for(let apiName in this.availableAPIs) {
            let api = this.availableAPIs[apiName]

            api.getProjectList(list => {
                // tag everything with which API it came from
                for(var item of list) {
                    // use a function so it doesn't get saved to JSON
                    item.$getApi = () => api
                    item.$apiName = apiName
                }

                lists.push(list)
                if(lists.length === Object.keys(this.availableAPIs).length) cb(aggregate())
            })
        }

        function aggregate() {
            // combine all the separate lists
            var listAll = []
            for(var list of lists) listAll = listAll.concat(list)

            // now sort them by timestamp. later should come first, hence b - a
            listAll.sort((a, b) => b.timestamp - a.timestamp)
            return listAll
        }
    }

    /*
        Gets an array of save methods on this device. Each is an object with a
        buttonIcon, buttonText, and cb (a callback that takes a project name
        and desc).
    */
    getSaveMethods() {
        throw "Not Implemented: getSaveMethods"
    }


    /*
        Takes a project file location as a parameter, loads the project, and then
        calls viewProject
    */
    openProject(location, onerr) {
        throw "Not Implemented: openProject"
    }

    /*
        Takes a project object as a parameter and builds an editor for it in the
        current webpage.
    */
    viewProject(project) {
        throw "Not Implemented: viewProject"
    }

    /*
        Open a new window with a documentation page
    */
    showDocs(page) {
        throw "Not Implemented: showDocs"
    }

    /*
        Display the license file
    */
    showLicense() {
        this.showDocs("license")
    }

    /*
        Open a new window with the welcome page
    */
    showWelcome() {
        throw "Not Implemented: showWelcome"
    }

    /*
        View a webpage, as when an external link is clicked
    */
    showWebpage(url) {
        throw "Not Implemented: showWebpage"
    }

    /*
        Show a settings page or modal.
    */
    showSettings() {
        var settingsModal = settings.createSettingsModal()
        settingsModal.show()
    }

    /*
        Handle an error of some sort.
    */
    handleError(title, message, debug) {
        throw "Not Implemented: handleError"
    }

    /*
        Show an exit confirmation, if necessary.
    */
    showExitConfirmation() {
        throw "Not Implemented: showExitConfirmation"
    }
}

module.exports = Environment
