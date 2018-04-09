"use strict"

// The layer of abstraction between the project data and the actual storage
// medium. Takes requests for certain types of data (project store, assets,
// documents) and passes them on to a filesystem.
//
// This extra layer of abstraction isn't strictly necessary, but it removes the
// need to hardcode paths to files elsewhere.

const uuid = require('uuid/v4')

class ProjectStore {
    constructor(storageAPI) {
        this._storageAPI = storageAPI
    }

    /* Put the project at the top of the project listing */
    updateListing(name, desc) {
        this._storageAPI.updateListing(name, desc)
    }

    isEditable() {
        return this._storageAPI.isEditable()
    }

    /* Get a user-facing string describing where the project is stored. */
    getLocationString() {
        return this._storageAPI.getLocationString()
    }

    getProjectFile(cb) {
        this._storageAPI.readTextFile("project.json", (err, data) => {
            if(err) cb(err)
            else cb(undefined, JSON.parse(data))
        })
    }
    saveProjectFile(jsonString, cb) {
        this._storageAPI.writeFile("project.json", jsonString, cb)
    }

    addAsset(data, cb) {
        var id = uuid()
        this._storageAPI.writeFile(`media/${ id }`, data, err => {
            if(err) cb(err)
            else cb(undefined, id)
        })
    }
    getAsset(id, cb) {
        this._storageAPI.readFile(`media/${ id }`, cb)
    }
    getAssetUrl(id, cb) {
        if(this._storageAPI.getFileUrl) {
            this._storageAPI.getFileUrl(`media/${ id }`, (err, url) => {
                if(err) cb("")
                else cb(url)
            })
        } else {
            this.getAsset(id, (err, data) => {
                if(err) cb("")
                else cb(`data:;base64,${ data.toString("base64") }`)
            })
        }
    }
    deleteAsset(id, cb) {
        this._storageAPI.deleteFile(`media/${ id }`, cb)
    }
}

module.exports = ProjectStore
