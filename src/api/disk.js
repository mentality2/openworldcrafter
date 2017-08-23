"use strict"

const jszip = require('jszip')
const fs = require('fs')
const project = require('../project')
const uuid = require('uuid/v4')
const path = require('path')
const electron = require('electron')

const noop = () => {}

class DiskProjectStore {
    /*
     * If project is defined, a new project file will be created. If it is null,
     * the existing project in the file will be loaded.
     */
    constructor(file, proj, readycb, errcb) {
        this._file = file
        this.editable = true

        this.location = file

        if(proj) {
            // this._project is the project object
            this._project = proj
            proj.$store = this
            proj.markDirty()

            this._archive = new jszip()

            readycb(proj)
        } else {
            fs.readFile(file, (err, contents) => {
                if(err) {
                    errcb("The project file has been moved or deleted.")
                    return
                }

                jszip.loadAsync(contents).then(archive => {
                    this._archive = archive
                    return archive.files["project.json"].async("text")
                    .then(file => {
                        var proj = new project.Project(JSON.parse(file), this)
                        this._project = proj
                        readycb(proj)
                    })
                })
                .catch(e => {
                    errcb("This project file seems to be corrupt.")
                })
            })
        }
    }

    getProjectFile(cb) {
        cb(project.serialize())
    }

    /**
     * Saves the string given as the project file.
     */
    saveProjectFile(project, cb, onerr) {
        this._archive.file("project.json", project)
        this.save(cb, onerr)
    }

    addAsset(buffer, cb) {
        var name = uuid()

        this._archive.file("media/" + name, buffer)

        this.save()

        cb(name)
        return name
    }

    /**
     * Returns Base64
     */
    getAsset(name, cb) {
        this._archive.files["media/" + name].async("base64")
        .then(cb)
    }

    getAssetUrl(name, cb) {
        this._archive.files["media/" + name].async("base64")
        .then(data => cb(`data:;base64,${data}`))
    }

    deleteAsset(name, cb) {
        this._archive.remove("media/" + name)
        cb()
    }

    /**
     * Writes the zip file to the disk.
     */
    save(cb, onerr) {
        var stream = fs.createWriteStream(this._file)
        stream.on("close", cb || noop)
        stream.on("error", err => {
            (onerr || noop)("The project could not be saved to this location.", "Save Elsewhere", () => {
                // Show a save dialog to save the project elsewhere
                electron.remote.dialog.showSaveDialog({
                    title: "Save Project",
                    defaultPath: path.basename(this._file)
                }, filename => {
                    this._file = filename
                    this.save(cb, onerr)
                    $owf.addRecentProject(this._project.info.name, this._file, this._project.info.description)
                })
            })
        })

        this._archive.generateNodeStream({ type: "nodebuffer", streamFiles: true })
        .pipe(stream)
    }

    changeName() {
        $owf.addRecentProject(this._project.info.name, this._file, this._project.info.description)
    }
}

module.exports = DiskProjectStore
