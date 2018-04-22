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
    constructor(projectid, cb) {
        super(projectid, cb)

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
        cb(undefined, webrequest.origin + "/api/projects/" + this._id + "/files/" + encodeURIComponent(file))
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
        webrequest.getResource(`/api/projects/${ this._id }/files/${ encodeURIComponent(file) }`, cb)
    }
    /*
    Reads a string from the file, raising an error if it does not exist.
    */
    readTextFile(file, cb) {
        webrequest.getResource(`/api/projects/${ this._id }/files/${ encodeURIComponent(file) }`, cb)
    }

    /*
    Writes the data to a file, creating it if it does not exist.
    */
    writeFile(file, data, cb) {
        webrequest.putResource(`/api/projects/${ this._id }/files/${ encodeURIComponent(file) }`, data, cb)
    }

    /*
    Deletes the file. Does nothing if it does not exist.
    */
    deleteFile(file, cb) {
        webrequest.deleteResource(`/api/projects/${ this._id }/files/${ encodeURIComponent(file) }`, cb)
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
        webrequest.deleteResource(`/api/projects/${ location }`, cb)
    }

    createProject(cb, name) {
        webrequest.postForm(`/api/user/projects`, { name }, (err, res) => {
            if(err) cb(err)
            else new WebStorageAPI(JSON.parse(res).projectid, cb)
        })
    }

    getProjectList(cb) {
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
