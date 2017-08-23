"use strict"

class File {
    constructor(name, filepath, lastAccessed) {
        this.name = name
        this.filepath = filepath
        this.lastAccessed = lastAccessed
    }
}

module.exports = File
