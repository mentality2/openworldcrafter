"use strict"

const jszip = $native.jszip
const fs = $native.fs
const project = require('../project')
const uuid = $native.uuid
const path = $native.path
const electron = $native.electron
const projectlist = require('./projectlist.js')
const utils = require('../utils.js')

const noop = () => {}

class DiskStorageAPI extends require("./") {
    constructor(filepath, cb, mustCreate) {
        super(filepath, cb, mustCreate)

        this._file = filepath

        if(mustCreate) {
            this._archive = new jszip()
            cb(undefined, this)
        } else {
            fs.readFile(this._file, (err, contents) => {
                if(err) {
                    cb("The project file has been moved or deleted.")
                    return
                }

                jszip.loadAsync(contents)
                .then(archive => {
                    this._archive = archive
                    cb(undefined, this)
                })
                .catch(cb)
            })
        }
    }

    updateListing(name, desc) {
        module.exports.getProjectList(list => {
            list.addProjectEntry(name, this._location, desc)
        })
    }

    /* Get a user-facing string describing where the project is stored. */
    getLocationString() {
        return `Saved to ${ this._file }`
    }

    /*
    Whether we can currently edit the project.
    */
    isEditable() {
        return true
    }

    /*
    Reads from the file, raising an error if it does not exist.
    */
    readFile(file, cb) {
        // we can use nodebuffers because the disk api only works on electron
        console.log("reading file", file);
        this._archive.files[file].async("nodebuffer")
        .then(data => cb(undefined, data))
        .catch(err => cb(err))
    }
    /*
    Reads from the file, raising an error if it does not exist.
    */
    readTextFile(file, cb) {
        // we can use nodebuffers because the disk api only works on electron
        this._archive.files[file].async("text")
        .then(data => cb(undefined, data))
        .catch(err => cb(err))
    }

    /*
    Writes the data to a file, creating it if it does not exist.
    */
    writeFile(file, data, cb) {
        this._archive.file(file, data)
        this._commit(cb)
    }

    /*
    Deletes the file. Does nothing if it does not exist.
    */
    deleteFile(file, cb) {
        this._archive.remove("media/" + name)
        this._commit(cb)
    }

    /**
     * Writes the zip file to the disk.
     */
    _commit(cb) {
        var stream = fs.createWriteStream(this._file)
        stream.on("close", event => cb(undefined, event))
        stream.on("error", err => {
            (onerr || noop)("The project could not be saved to this location.", "Save Elsewhere", () => {
                // Show a save dialog to save the project elsewhere
                electron.remote.dialog.showSaveDialog({
                    title: "Save Project",
                    defaultPath: path.basename(this._file)
                }, filename => {
                    this._file = filename
                    this._commit(cb)
                    $owf.addRecentProject(this._project.info.name, this._file, this._project.info.description)
                })
            })
        })

        this._archive.generateNodeStream({ type: "nodebuffer", streamFiles: true })
        .pipe(stream)
    }
}

class DiskApiDescription extends require("./apidescription.js") {
    constructor() {
        super()

        this.buttonText = "Save to Computer"
        this.storageAPI = DiskStorageAPI
        this.name = "disk"

        var projectListData = JSON.parse(localStorage["openworldcrafter.recentFiles"] || "[]")
        this._projectList = new projectlist.ProjectList(projectListData, save => {
            localStorage.setItem("openworldcrafter.recentFiles", JSON.stringify(save))
        })
    }

    createProject(cb, name) {
        electron.remote.dialog.showSaveDialog({
            title: "Save Project",
            defaultPath: name + ".owc"
        }, filename => {
            new DiskStorageAPI(filename, cb, true)
        })
    }

    getProjectList(cb) {
        cb(this._projectList)
    }
}

module.exports = new DiskApiDescription()
