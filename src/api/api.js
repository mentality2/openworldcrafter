"use strict"

const webrequest = require('./webrequest.js')
const project = require('../project')
const projectlist = require('./projectlist')
const utils = require('../utils.js')
const noop = () => {}

/*
 * For saving projects to the server
 */

class OnlineProjectStore extends require("./") {
    constructor(projectID, readycb) {
        super()

        this._pid = projectID

        this.getProjectFile(obj => {
            this.getMeFile(me => {
                this.editable = me.canEdit
                readycb(new project.Project(obj, this))
            })
        })
    }

    getLocationString() {
        return "Saved Online"
    }

    getProjectFile(cb) {
        webrequest.getResource(`/project/${this._pid}/project.json`, function(err, res) {
            if(err) {
                $owf.handleError(res)
            } else {
                cb(JSON.parse(res))
            }
        })
    }

    getMeFile(cb) {
        webrequest.getResource(`/project/${this._pid}/me.json`, function(err, res) {
            if(err) {
                // TODO: handle
                console.log(err)
            } else {
                cb(JSON.parse(res))
            }
        })
    }

    saveProjectFile(data, cb) {
        webrequest.putResourceJsonText(`/project/${this._pid}/project.json`, data, function(err, res) {
            if(err) {
                // TODO: handle
                console.log(err)
            } else {
                (cb || noop)()
            }
        })
    }

    addAsset(buffer, cb) {
        if(buffer.size > 1000000) {
            return false
        }

        webrequest.postResourceFile(`/project/${this._pid}/media`, buffer, function(err, res) {
            if(err) {
                $owf.handleError(res)
            } else {
                cb(res)
            }
        })
    }

    getAsset(name, cb) {
        throw "Not Implemented"
    }

    getAssetUrl(name, cb) {
        cb(`${webrequest.origin}/project/${this._pid}/media/${name}`)
    }

    deleteAsset(name, cb) {
        webrequest.deleteResource(`/project/${this._pid}/media/${name}`, (err, res) => {
            if(err) {
                // TODO: handle
            } else {
                cb()
            }
        })
    }

    changeName() {
        // we don't actually have to do anything here b/c the server handles
        // recent files
    }

    save(cb, update) {
        // no need to do anything here because files are saved in their own
        // respective functions. the disk api uses this to flush the zip file to
        // the disk, which doesn't apply here
    }

    getSharingSettings(cb) {
        webrequest.getResource(`/project/${this._pid}/sharing.json`, function(err, res) {
            if(err) {
                // TODO: handle
                console.log(err)
            } else {
                cb(JSON.parse(res))
            }
        })
    }
    invite(emailAddress, message, cb) {
        var data = {
            emailAddress, message
        }
        webrequest.postResourceJson(`/project/${this._pid}/invite`, data, function(err, res) {
            if(err) {
                // TODO: handle
                console.log(err)
            } else {
                (cb || noop)()
            }
        })
    }
    removePermission(userID, cb) {
    }
}

module.exports = OnlineProjectStore

class OnlineApiDescription extends require("./apidescription.js") {
    constructor() {
        super()

        this.buttonText = "Save Online"
        this.buttonIcon = "cloud"
    }

    openProject(location, onerr) {
        var appapi = new OnlineProjectStore(location, proj => {
            utils.launchEditor(location, "web")
        }, err => {
            if(err === "project version mismatch, please update openworldcrafter") {
                $owf.handleError("Update Required", "This project was created in a newer version of openworldcrafter. Please update to view it so data isn't lost.")
            } else {
                console.log(err)
                onerr(err)
            }
        })
    }

    // deleteProject(location, name, cb) {
    // }

    createProject(name, desc, uuid) {
    }

    shareProject(id, cb) {
    }

    _getProjectList(cb) {
        if(this._projectList) {
            cb(this._projectList)
            return
        }

        webrequest.getResource("/user/projectlist", (err, res) => {
            if(err) {
                $owf.handleError("Error", "Could not get your list of projects. Maybe there is a network problem?")
                return
            }

            this._projectList = new projectlist.ProjectList(JSON.parse(res), (data, cb) => {
                // not applicable
            })
            cb(this._projectList)
        })
    }

    getProjectList(cb) {
        this._getProjectList(list => cb(list.projects))
    }
}

module.exports.getOnlineApi = function(cb) {
    webrequest.attemptLogin(result => {
        console.log(result ? "Logged in" : "Not logged in")
        if(result) cb(new OnlineApiDescription())
        else cb()
    })
}
