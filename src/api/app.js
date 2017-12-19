"use strict"

const project = require('../project')
const uuid = require('uuid/v4')
const fs = require('./fileplugin')

const noop = () => {}

function getProjectDirectory(id) {
    return "projects/" + id + "/"
}

/*
 * For saving projects on the mobile app
 */
class AppProjectStore {
    /*
     * If project is defined, a new project file will be created. If it is null,
     * the existing project in the file will be loaded.
     */
    constructor(id, proj, readycb, errcb) {
        this._id = id
        this._dir = getProjectDirectory(id)
        this.editable = true

        fs.readdir(this._dir)

        if(proj) {
            // this._project is the project object
            this._project = proj
            proj.$store = this
            proj.markDirty()

            // Create directory structure
            fs.mkdir_safe("projects", cb => {
                fs.mkdir_safe(this._dir, cb2 => {
                    fs.mkdir_safe(this._dir + "media", cb3 => {
                        readycb(proj)
                    })
                })
            })
        } else {
            fs.readFile(this._dir + "project.json", (err, contents) => {
                if(err) {
                    errcb("The project file has been moved or deleted.")
                    return
                }

                try {
                    var proj = new project.Project(JSON.parse(contents), this)
                } catch(e) {
                    errcb(e)
                }
                this._project = proj
                readycb(proj)
            })
        }
    }

    getLocationString() {
        return "Saved to your device"
    }

    getProjectFile(cb) {
        cb(project.serialize())
    }

    /**
     * Saves the string given as the project file.
     */
    saveProjectFile(project, cb, onerr) {
        fs.writeFile(this._dir + "project.json", project, err => {
            if(err) onerr(err)
            else cb()
        })
    }

    addAsset(blob, cb) {
        var name = uuid()

        fs.mkdir_safe(this._dir + "media", err => {
            fs.writeFileBlob(this._dir + "media/" + name, blob, (err, success) => {
                if(err) {
                    $owf.handleError("Error", "The attachment could not be added to the project.", err)
                } else cb(name)
            })
        })

        return name
    }

    getAssetUrl(name, cb) {
        fs.getURL(this._dir + "media/" + name, (err, url) => {
            if(err) {
                // TODO: handle
            } else cb(url)
        })
    }

    deleteAsset(name, cb) {
        fs.deleteFile(this._dir + "media/" + name, cb)
    }

    changeName() {
        $owf.getProjectList(list => {
            list.addProjectEntry(this._project.info.name, this._id, this._project.info.description)
        })
    }
}

module.exports = AppProjectStore

function deleteProject(location, name, cb) {
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

        fs.deleteDirectory(dir)
    })
}

function createProject(name, desc) {
    var proj = project.createProject(name, desc)

    proj.$store = new OnlineProjectStore(proj.info.uuid, proj, () => {
        proj.save()
        $owf.getProjectList(list => list.addProjectEntry(name, proj.info.uuid, desc))
        $owf.viewProject(proj)
    })
}

function shareProject(id, cb) {
    fs.makeZipFile(getProjectDirectory(id), (err, zip) => {
        if(err) cb(err)
        else {
            fs.writeFileBlobExternal(id + ".owf", zip, cb)
        }
    })
}

module.exports.apiDescription = {
    buttonText: "Save to Device",
    buttonIcon: "phone",
    deleteProject, shareProject, createProject, shareProject
}
