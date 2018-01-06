"use strict"

const api = require('../api/api')
const dom = require('../dom')

class WebEnviroment extends require("./") {
    constructor() {
        super()

        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "iframe"
        this.styleDir = "/dist/styles/"

        this.buildType = "web"

        this._onFinishLoad()
    }

    getProjectList(cb) {

    }

    /*
        Takes a project file location as a parameter, loads the project, and then
        calls viewProject
    */
    openProject(location) {
        this.projectID = location
        var webapi = new api(location, proj => {
            this.viewProject(proj)
        })
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
        window.open("/dist/docs/" + page.replace(/\.md$/, ".htm"), "_blank")
    }

    /*
        Open a new window with the welcome page
    */
    showWelcome() {
        window.open("/user/welcome", "_blank")
    }

    /*
        View a webpage, as when an external link is clicked
    */
    showWebpage(url) {
        window.open(url, "_blank")
    }

    handleError(error) {
        if(typeof error === "string") {
            var match = error.match(/^(\d{3}) ([\w\s]+)(?:; (.+))?$/)
            if(match) {
                var errorCode = match[3]
            } else {
                var errorCode = error
            }
        } else {
            var errorCode = "Unknown error"
        }

        var modal = dom.modal("Error")

        var paragraph = dom.div()
        var modalActions = dom.div(undefined, "modal-actions")

        switch(errorCode) {
            case "not signed in":
                paragraph.textContent = "You are not signed in."

                modalActions.appendChild(dom.button(undefined, "Log In", () => window.open("/login")))

                break
            case "file is not an image":
                paragraph.textContent = "Attachments must be images."

                modalActions.appendChild(dom.button(undefined, "Cancel", () => modal.wrapper.remove()))

                break
            case "no permissions on project":
                paragraph.textContent = "You do not have permission to view this project."

                modalActions.appendChild(dom.button(undefined, "Back", () => window.history.go(-1)))

                break
            case "this account is inactive":
                paragraph.textContent = `Your account is inactive. You may renew your subscription or download your project to edit in the desktop editor.`

                var download = dom.button("download", "Download", () => {
                    window.open(`/project/${ this.projectID }/download`)
                })
                var renew = dom.button(undefined, "Renew", () => {
                    window.open("/user/settings#payment")
                })

                modalActions.appendChild(download)
                modalActions.appendChild(renew)

                break
            default:
                paragraph.textContent = errorCode
                break
        }

        modal.modal.appendChild(paragraph)
        modal.modal.appendChild(modalActions)

        document.body.appendChild(modal.wrapper)
        modal.show()
    }

    /*
        Show the 'Are you sure you want to exit?' modal
    */
    showExitConfirmation() {
        var res = confirm("Changes won't be saved! Are you sure you want to close?") ? undefined : true
        return res
    }
}

global.$owf = new WebEnviroment()
