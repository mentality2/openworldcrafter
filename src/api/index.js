"use strict"

class IProjectStore {
    constructor(file, proj, readycb) {
    }

    /*
        Gets a human-readable string explaining where the project is stored
    */
    getLocationString() {
        throw "Not Implemented: getLocationString"
    }

    /*
        Gets the project file as a string
    */
    getProjectFile(cb) {
        throw "Not Implemented: getProjectFile"
    }

    /*
        Saves the project file.
    */
    saveProjectFile(project, cb) {
        throw "Not Implemented: saveProjectFile"
    }

    /*
        Adds an asset, passing its ID to the callback
    */
    addAsset(buffer, cb) {
        throw "Not Implemented: addAsset"
    }

    /*
        Gets an asset by its ID, returning it as base64
    */
    getAsset(name, cb) {
        throw "Not Implemented: getAsset"
    }

    /*
        Gets a URL for an asset
    */
    getAssetUrl(name, cb) {
        throw "Not Implemented: getAssetUrl"
    }

    deleteAsset(name, cb) {
        throw "Not Implemented: deleteAsset"
    }

    changeName() {
        throw "Not Implemented: changeName()"
    }

    /*
        Saves the project.

        Update is may be periodically called with the progress, a double from
        0-1
    */
    save(cb, update) {
        throw "Not Implemented: save"
    }
}

module.exports = IProjectStore
