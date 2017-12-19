"use strict"

const noop = () => {}
const jszip = require('jszip')

/* Helper functions for Cordova File Plugin. */

module.exports.readFile = function(filename, cb) {
    var filepath = cordova.file.dataDirectory + filename

    window.resolveLocalFileSystemURL(filepath, fileEntry => {
        fileEntry.file(file => {
            var reader = new FileReader()

            // no, this can't be an arrow function. >:-(
            reader.onloadend = function() {
                (cb || noop)(undefined, this.result)
            }

            reader.readAsText(file)
        }, cb || noop)
    }, cb || noop)
}

function readFileArrayBuffer(filename, cb) {
    var filepath = cordova.file.dataDirectory + filename

    window.resolveLocalFileSystemURL(filepath, fileEntry => {
        fileEntry.file(file => {
            var reader = new FileReader()

            // no, this can't be an arrow function. >:-(
            reader.onloadend = function() {
                (cb || noop)(undefined, this.result)
            }

            reader.readAsArrayBuffer(file)
        }, cb || noop)
    }, cb || noop)
}
module.exports.readFileArrayBuffer = readFileArrayBuffer

module.exports.writeFileJSON = function(filename, data, cb) {
    module.exports.writeFile(filename, JSON.stringify(data), cb)
}

module.exports.writeFile = function(filename, string, cb) {
    var blob = new Blob([string], { type: "text/plain" })
    module.exports.writeFileBlob(filename, blob, cb)
}

/* Writes to a file, creating it if it does not exist. */
module.exports.writeFileBlob = function(filename, blob, cb) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, dirEntry => {
        dirEntry.getFile(filename, { create: true, exclusive: false }, fileEntry => {
            fileEntry.createWriter(writer => {
                writer.onwriteend = e => (cb || noop)(undefined, "success")
                writer.onerror = e => (cb || noop)(e)

                writer.write(blob)
            }, cb || noop)
        }, cb || noop)
    }, cb || noop)
}

/* Writes to a file, creating it if it does not exist. */
// TODO: for testing, remove
module.exports.writeFileBlobExternal = function(filename, blob, cb) {
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, dirEntry => {
        dirEntry.getFile(filename, { create: true, exclusive: false }, fileEntry => {
            console.log("output file", fileEntry);
            fileEntry.createWriter(writer => {
                writer.onwriteend = e => (cb || noop)(undefined, "success")
                writer.onerror = e => (cb || noop)(e)

                writer.write(blob)
            }, cb || noop)
        }, cb || noop)
    }, cb || noop)
}

module.exports.deleteFile = function(file, cb) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + file, fileEntry => {
        fileEntry.remove(cb)
    }, cb)
};

module.exports.getURL = function(file, cb) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + file, fileEntry => {
        cb(undefined, fileEntry.toURL())
    }, cb)
}

module.exports.mkdir_safe = function(name, cb) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, parentEntry => {
        parentEntry.getDirectory(name, { create: true, exclusive: false }, dirEntry => {
            (cb || noop)(undefined, "success")
        }, cb || noop)
    }, cb || noop)
}

module.exports.deleteDirectory = function(dir, cb) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + dir, dirEntry => {
        dirEntry.removeRecursively(() => {
            cb()
        }, cb || noop)
    }, cb || noop)
}

function readdir(dir, cb) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + dir, dirEntry => {
        var reader = dirEntry.createReader()
        reader.readEntries(entries => {
            (cb || noop)(undefined, entries)
        }, cb || noop)
    }, cb || noop)
}
module.exports.readdir = readdir

/*
    note that this is a breadth-first search. also, it does not list directories
*/
function readdirRecursive(dir, cb, list) {
    if(!Array.isArray(dir)) dir = [dir]
    if(!list) list = []

    if(!dir.length) cb(undefined, list)
    else {
        readdir(dir[0], (err, entries) => {
            if(err) cb(err)
            else {
                for(var entry of entries) {
                    var name = dir[0] + "/" + entry.name

                    if(entry.isDirectory) dir.push(name)
                    else list.push(name)
                }

                // remove the directory we just read
                dir.shift()
                // now keep going down that list
                readdirRecursive(dir, cb, list)
            }
        })
    }
}
module.exports.readdirRecursive = readdirRecursive

module.exports.makeZipFile = function(dir, cb) {
    var zip = new jszip()

    readdirRecursive(dir, (err, list) => {
        if(err) {
            cb(err)
            return
        }
        var remaining = list.length

        for(var entry of list) {
            readFileArrayBuffer(entry, (err, buffer) => {
                if(err) {
                    // make sure the callback isn't called again
                    remaining = -1
                    cb(err)
                } else {
                    zip.file(entry, buffer)
                    remaining --

                    if(remaining === 0) {
                        console.log("creating zip file")
                        zip.generateAsync({ type: "blob" }).then(file => cb(undefined, file))
                    }
                }
            })
        }
    })
}
