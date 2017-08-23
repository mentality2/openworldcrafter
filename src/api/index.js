"use strict"

class IProjectStore {
    constructor(file, proj, readycb) {
        throw "Not Implemented"
    }

    /*
        Gets the project file as a string
    */
    getProjectFile(cb) {
        throw "Not Implemented"
    }

    /*
        Saves the project file.
    */
    saveProjectFile(project, cb) {
        throw "Not Implemented"
    }

    /*
        Adds an asset, passing its ID to the callback
    */
    addAsset(buffer, cb) {
        throw "Not Implemented"
    }

    /*
        Gets an asset by its ID, returning it as base64
    */
    getAsset(name, cb) {
        throw "Not Implemented"
    }

    /*
        Gets a URL for an asset
    */
    getAssetUrl(name, cb) {
        throw "Not Implemented"
    }

    /*
        Saves the project.

        Update is may be periodically called with the progress, a double from
        0-1
    */
    save(cb, update) {
        throw "Not Implemented"
    }
}
