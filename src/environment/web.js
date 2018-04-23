"use strict"

const web = require('../api/web.js')
const webrequest = require('../api/webrequest.js')
const dom = require('../dom')
const utils = require('../utils.js')

class WebEnviroment extends require("./") {
    constructor() {
        super()

        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "iframe"
        this.styleDir = "/resources/styles/"

        this.availableAPIs = {
            web: new web()
        }

        this._onFinishLoad()
    }

    /*
        Open a new window with a documentation page
    */
    showDocs(page) {
        window.open("/resources/docs/index.htm#" + page, "_blank")
    }

    /*
        Display the license file
    */
    showLicense() {
        window.open("/resources/docs/license.htm", "_blank")
    }

    /*
        Open a new window with the welcome page
    */
    showWelcome() {
        window.open("/pages/welcome.htm", "_blank")
    }

    /*
        View a webpage, as when an external link is clicked
    */
    showWebpage(url) {
        window.open(url, "_blank")
    }

    /*
        Show the 'Are you sure you want to exit?' modal
    */
    showExitConfirmation() {
        var res = confirm("Changes won't be saved! Are you sure you want to close?") ? undefined : true
        return res
    }

    handleError(title, error, debug) {
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

        var modal = dom.modal("Error", true)

        var paragraph = dom.div()
        var modalActions = dom.div(undefined, "modal-actions")

        switch(errorCode) {
            case "not signed in":
                paragraph.textContent = "You are not signed in."

                modalActions.appendChild(dom.button(undefined, "Log In", () => window.open("/login")))

                break
            case "file is not an image":
                paragraph.textContent = "Attachments must be images."

                modalActions.appendChild(dom.button(undefined, "Cancel", () => modal.hide()))

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

        modal.appendChild(paragraph)
        modal.appendChild(modalActions)

        modal.show()

        removePlaceholder()
    }

    /* WEB ONLY STUFF */
    showUploadDialog(cb) {
        cb = cb || (() => {})
        function upload(files) {
            let loadProject = files.length === 1

            for(var file of files) {
                webrequest.postResource("/api/user/projects/upload", file, (err, data) => {
                    if(err) $owf.handleError("Error Uploading Project", "The project could not be uploaded.", err)
                    else {
                        if(loadProject) utils.launchEditor(JSON.parse(data).projectid, "web")
                        else cb()
                    }
                })
            }
        }

        var input = dom.element("input", "", "invisible")
        input.type = "file"
        input.multiple = true
        input.onchange = () => {
            upload(input.files)
        }

        input.click()

        document.body.appendChild(input)
    }
}

global.$owf = new WebEnviroment()
