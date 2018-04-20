"use strict"

const webrequest = require('./webrequest.js')
const project = require('../project')
const projectlist = require('./projectlist')
const utils = require('../utils.js')
const noop = () => {}

/*
 * For saving projects to the server
 */

class WebStorageAPI extends require("./") {
    constructor(projectid, cb, mustCreate) {
        super()

        this._id = projectid

        cb(undefined, this)
    }

    /* Put the project at the top of the project listing */
    updateListing(name, desc) {
        // handled on the server, not the client. do nothing
    }

    /* Get a user-facing string describing where the project is stored. */
    getLocationString() {
        return "Saved online"
    }

    /*
    If files can be accessed by URLs, this function converts filenames to URLs
    */
    getFileUrl(file, cb) {
        return webrequest.origin + "/api/projects/" + this._id + "/files/" + encodeURIComponent(file)
    }

    /*
    Whether we can currently edit the project.
    */
    isEditable() {
        return true
    }

    /*
    Reads binary data from the file, raising an error if it does not exist.
    */
    readFile(file, cb) {
        throw "Not Implemented: readFile()"
    }
    /*
    Reads a string from the file, raising an error if it does not exist.
    */
    readTextFile(file, cb) {
        throw "Not Implemented: readTextFile()"
    }

    /*
    Writes the data to a file, creating it if it does not exist.
    */
    writeFile(file, data, cb) {
        throw "Not Implemented: writeFile()"
    }

    /*
    Deletes the file. Does nothing if it does not exist.
    */
    deleteFile(file, cb) {
        throw "Not Implemented: deleteFile()"
    }
}

class WebApiDescription extends require("./apidescription.js") {
    constructor() {
        super()

        this.buttonText = "Save Online"
        this.buttonIcon = "cloud"
        this.name = "web"

        this.storageAPI = WebStorageAPI
    }

    deleteProject(location, name, cb) {
    }

    createProject(cb) {
    }

    getProjectList(cb) {
        if(this._projectList) {
            cb(this._projectList)
            return
        }

        webrequest.getResource("/api/user/projects", (err, res) => {
            if(err) {
                $owf.handleError("Error", "Could not get your list of projects. Maybe there is a network problem?")
                return
            }

            this._projectList = new projectlist.ProjectList(JSON.parse(res).projects, (data, cb) => {
                // not applicable
            })
            cb(this._projectList)
        })
    }
}

module.exports = WebApiDescription

// for devices
module.exports.checkAvailability = function(cb) {
    webrequest.attemptLogin(cb)
}
