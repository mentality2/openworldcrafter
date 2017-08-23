"use strict"

require("./common.js")

class Environment {
    constructor() {
        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "iframe"
    }

    /*
        Takes a project file location as a parameter, loads the project, and then
        calls viewProject
    */
    openProject(location) {
        throw "Not Implemented"
    }

    /*
        Takes a project object as a parameter and builds an editor for it in the
        current webpage.
    */
    viewProject(project) {
        throw "Not Implemented"
    }

    /*
        Open a new window with a documentation page
    */
    showDocs(page) {
        throw "Not Implemented"
    }

    /*
        Open a new window with the welcome page
    */
    showWelcome() {
        throw "Not Implemented"
    }

    /*
        View a webpage, as when an external link is clicked
    */
    showWebpage(url) {
        throw "Not Implemented"
    }
}

module.exports = Environment
