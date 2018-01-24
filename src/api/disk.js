"use strict"

const jszip = $native.jszip
const fs = $native.fs
const project = require('../project')
const uuid = $native.uuid
const path = $native.path
const electron = $native.electron
const projectlist = require('./projectlist.js')

const noop = () => {}

class DiskProjectStore extends require("./") {
    /*
     * If project is defined, a new project file will be created. If it is null,
     * the existing project in the file will be loaded.
     */
    constructor(file, proj, readycb, errcb) {
        super()

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
                    if(e === "project version mismatch, please update openworldcrafter") {
                        $owf.handleError("Update Required", "This project was created in a newer version of openworldcrafter. Please update to view it so data isn't lost.")
                    } else {
                        errcb("This project file seems to be corrupt.")
                        console.log(e)
                    }
                })
            })
        }
    }

    getLocationString() {
        return "Saved to " + this._file
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
        module.exports.DiskApiDescription._getProjectList(list => list.addProjectEntry(this._project.info.name, this._file, this._project.info.description))
    }
}

module.exports = DiskProjectStore

class DiskApiDescription extends require("./apidescription.js") {
    constructor() {
        super()

        this.buttonText = "Save to Computer"

        var projectListData = JSON.parse(localStorage["openworldcrafter.recentFiles"] || "[]")
        this._projectList = new projectlist.ProjectList(projectListData, save => {
            localStorage.setItem("openworldcrafter.recentFiles", JSON.stringify(save))
        })
    }

    createProject(name, desc) {
        electron.remote.dialog.showSaveDialog({
            title: "Save Project",
            defaultPath: name + ".owc"
        }, filename => {
            var proj = project.createProject(name, desc)
            proj.$store = new DiskProjectStore(filename, proj, () => {
                proj.save()
                this._projectList.addProjectEntry(name, filename, desc)
                $owf.viewProject(proj)
            })
        })
    }

    openProject(location, onerr) {
        var diskapi = new DiskProjectStore(location, undefined, proj => {
            this._projectList.addProject({
                name: proj.info.name,
                location,
                desc: proj.info.description
            })

            $owf.viewProject(proj)
        }, err => {
            if(err === "project version mismatch, please update openworldcrafter") {
                $owf.handleError("Update Required", "This project was created in a newer version of openworldcrafter. Please update to view it so data isn't lost.")
            } else {
                this._projectList.removeProject(location)
                onerr(err)
            }
        })
    }

    _getProjectList(cb) {
        cb(this._projectList)
    }

    getProjectList(cb) {
        cb(this._projectList.projects)
    }
}

module.exports.DiskApiDescription = new DiskApiDescription()
