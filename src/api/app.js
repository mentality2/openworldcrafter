"use strict"

const project = require('../project')
const uuid = require('uuid/v4')
const fs = window.$native.fs
const projectlist = require('./projectlist.js')
const utils = require('../utils.js')

const noop = () => {}

function getProjectDirectory(id) {
    return "projects/" + id + "/"
}

/*
 * For saving projects on the mobile app
 */
class AppStorageAPI extends require("./") {
    constructor(location, cb, mustCreate) {
        super(location, cb, mustCreate)
        this._dir = getProjectDirectory(location)

        if(mustCreate) {
            fs.mkdir_safe(this._dir, err => {
                if(err) cb(err)
                else cb(undefined, this)
            })
        } else {
            cb(undefined, this)
        }
    }

    updateListing(name, desc) {
        module.exports.getProjectList(list => {
            list.addProjectEntry(name, this._location, desc)
        })
    }

    getLocationString() {
        return "Saved to your device"
    }

    getFileUrl(file, cb) {
        fs.getURL(this._dir + file, cb)
    }

    isEditable() {
        return true
    }

    /*
    Reads from the file, raising an error if it does not exist.
    */
    readFile(file, cb) {
        fs.readFile(this._dir + file, cb)
    }
    /*
    Reads from the file, raising an error if it does not exist.
    */
    readTextFile(file, cb) {
        fs.readFile(this._dir + file, cb)
    }

    /*
    Writes the data to a file, creating it if it does not exist.
    */
    writeFile(file, data, cb) {
        var parent = ""
        if(file.includes("/")) parent = file.match(/(.+\/)[^\/]+$/)[1]
        fs.mkdir_safe(this._dir + parent, err => {
            if(err) cb(err)
            else fs.writeFileBlob(this._dir + file, data, cb)
        })
    }

    /*
    Deletes the file. Does nothing if it does not exist.
    */
    deleteFile(file, cb) {
        fs.deleteFile(this._dir + file, cb)
    }
}

class AppApiDescription extends require("./apidescription.js") {
    constructor() {
        super()

        this.buttonText = "Save to Device"
        this.buttonIcon = "phone"
        this.name = "app"

        this.storageAPI = AppStorageAPI
    }

    deleteProject(location, name, cb) {
        var dir = getProjectDirectory(location)

        fs.readFile(dir + "project.json", (err, contents) => {
            if(err) {
                cb(err)
                return
            }

            var project = JSON.parse(contents)
            if(project.info.name !== name) {
                cb("project name does not match")
                return
            }

            this.getProjectList(list => {
                list.removeProject(location, then => {
                    fs.deleteDirectory(dir, cb)
                })
            })
        })
    }

    createProject(cb) {
        var projectID = uuid()
        new AppStorageAPI(projectID, cb, true)
    }

    shareProject(id, cb) {
        fs.makeZipFile(getProjectDirectory(id), (err, zip) => {
            if(err) cb(err)
            else {
                fs.writeFileBlobExternal(id + ".owc", zip, cb)
            }
        })
    }

    getProjectList(cb) {
        if(this._projectList) cb(this._projectList)
        else {
            fs.readFile("projectlist.json", (err, data) => {
                // if the file isn't found, just ignore the situation. we'll create a blank array.
                if(err && err.code !== FileError.NOT_FOUND_ERR) {
                    this.handleError("Error", "Error loading project list", err)
                } else {
                    this._projectList = new projectlist.ProjectList(JSON.parse(data || "[]"), (data, cb) => {
                        fs.writeFileJSON("projectlist.json", data, (err, success) => {
                            if(err) console.log("write file error", err)
                            cb()
                        })
                    })

                    cb(this._projectList)
                }
            })
        }
    }
}

module.exports = new AppApiDescription()
