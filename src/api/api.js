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

    save(cb, update) {
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
