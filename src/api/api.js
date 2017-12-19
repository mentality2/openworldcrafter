"use strict"

const webrequest = require('./webrequest.js')
const project = require('../project')
const noop = () => {}

/*
 * For saving projects to the server
 */

class OnlineProjectStore {
    constructor(projectID, readycb) {
        this._pid = projectID

        this.getProjectFile(obj => {
            this.getMeFile(me => {
                this.editable = me.canEdit
                readycb(new project.Project(obj, this))
            })
        })
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
        webrequest.putResourceJson(`/project/${this._pid}/project.json`, data, function(err, res) {
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
        cb(`/project/${this._pid}/media/${name}`)
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
