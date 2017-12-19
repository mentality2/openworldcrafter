"use strict"

const common = require("./common.js")
const api = require('../api/app')
const dom = require('../dom')
const fs = require('../api/fileplugin')
const project = require('../project')

class AppEnvironment extends require("./index") {
    constructor() {
        super()

        this.mobile = true

        /*
            Used to switch between webview and iframe
        */
        this.iframeTag = "iframe"
        this.styleDir = "res/styles/"
    }

    getProjectList(cb) {
        if(this._projectList) cb(this._projectList)
        else {
            fs.readFile("projectlist.json", (err, data) => {
                // if the file isn't found, just ignore the situation. we'll create a blank array.
                if(err && err.code !== FileError.NOT_FOUND_ERR) {
                    // TODO: something
                    this.handleError("Error", "Error loading project list", err)
                } else {
                    this._projectList = new common.ProjectList(JSON.parse(data || "[]"), (data, cb) => {
                        fs.writeFileJSON("projectlist.json", data, (err, success) => {
                            if(err) console.log("write file error", err)
                        })
                    })

                    cb(this._projectList)
                }
            })
        }
    }

    getSaveMethods() {
        return [api.apiDescription]
    }

    /*
        Takes a project file location as a parameter, loads the project, and
        then calls viewProject
    */
    openProject(location, onerr) {
        this.projectID = location
        var appapi = new api(location, undefined, proj => {
            this.getProjectList(list => list.addProjectEntry(proj.info.name, location, proj.info.description))
            this.viewProject(proj)
        }, err => {
            if(err === "project version mismatch, please update OpenWorldFactory") {
                $owf.handleError("Update Required", "This project was created in a newer version of OpenWorldFactory. Please update to view it so data isn't lost.")
            } else {
                console.log(err)
                onerr(err)
            }
        })
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

    deleteProject(location, name) {
        this.getProjectList(list => {
            list.removeProject(location, () => {
                api.apiDescription.deleteProject(location, name, err => {
                    if(err === "project name does not match") this.handleError("Error", "That is not the name of the project.", err)
                    else this.handleError("Error", "Could not delete project", err)
                })
            })
        })
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

        var proj = project.createProject(name, desc)
        proj.$store = new api("5ff3bbc3-8a69-4b83-bc03-78379f6b0dbb", proj, () => {
            proj.save()
            this._projectList.addProjectEntry(name, "5ff3bbc3-8a69-4b83-bc03-78379f6b0dbb", desc)
            this.viewProject(proj)
        })
    }
}

global.$owf = new AppEnvironment()
