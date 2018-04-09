"use strict"

/*
Handles file methods
*/
class StorageAPI {
    constructor(locationDescriptor, cb, mustCreate) {
        this._location = locationDescriptor
    }

    /* Put the project at the top of the project listing */
    updateListing(name, desc) {
        throw "Not Implemented: updateListing()"
    }

    /* Get the internal string used to locate this stored project */
    getLocation() {
        return this._location
    }

    /* Get a user-facing string describing where the project is stored. */
    getLocationString() {
        throw "Not Implemented: getLocationString()"
    }

    /*
    If files can be accessed by URLs, this function converts filenames to URLs
    Commented out because not all APIs support it
    */
    // getFileUrl() {
    //     throw "Not Implemented: getFileUrl()"
    // }

    /*
    Whether we can currently edit the project.
    */
    isEditable() {
        throw "Not Implemented: isEditable()"
    }

    /*
    Reads binary data from the file, raising an error if it does not exist.
    */
    readFile(file, cb) {
        throw "Not Implemented: readFile()"
    }
    /*
    Reads a string from the file, raising an error if it does not exist.
    */
    readTextFile(file, cb) {
        throw "Not Implemented: readTextFile()"
    }

    /*
    Writes the data to a file, creating it if it does not exist.
    */
    writeFile(file, data, cb) {
        throw "Not Implemented: writeFile()"
    }

    /*
    Deletes the file. Does nothing if it does not exist.
    */
    deleteFile(file, cb) {
        throw "Not Implemented: deleteFile()"
    }
}

module.exports = StorageAPI
