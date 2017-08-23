"use strict"

/*
 * All callbacks will be called with arguments (err, responseText)
 */

function getResource(url, cb) {
    var req = new XMLHttpRequest()

    req.onreadystatechange = function() {
        if(req.readyState === 4) {
            if(req.status >= 200 && req.status < 300) {
                cb(null, req.responseText)
            } else {
                cb(req.status, req.responseText)
            }
        }
    }

    req.open("GET", url, true)
    req.send(null)
}

function putResourceJson(url, object, cb) {
    var req = new XMLHttpRequest()

    req.onreadystatechange = function() {
        if(req.readyState === 4) {
            if(req.status >= 200 && req.status < 300) {
                cb(null, req.responseText)
            } else {
                cb(req.status, req.responseText)
            }
        }
    }

    req.open("PUT", url, true)
    req.setRequestHeader("Content-Type", "application/json")
    req.setRequestHeader("X-CSRF-Token", global.$csrfToken)
    req.send(object)
}

function postResourceJson(url, object, cb) {
    var req = new XMLHttpRequest()

    req.onreadystatechange = function() {
        if(req.readyState === 4) {
            if(req.status >= 200 && req.status < 300) {
                cb(null, req.responseText)
            } else {
                cb(req.status, req.responseText)
            }
        }
    }

    req.open("POST", url, true)
    req.setRequestHeader("Content-Type", "application/json")
    req.setRequestHeader("X-CSRF-Token", global.$csrfToken)
    req.send(JSON.stringify(object))
}

function postResourceFile(url, file, cb) {
    var req = new XMLHttpRequest()

    req.onreadystatechange = function() {
        if(req.readyState === 4) {
            if(req.status >= 200 && req.status < 300) {
                cb(null, req.responseText)
            } else {
                cb(req.status, req.responseText)
            }
        }
    }

    req.open("POST", url, true)
    req.setRequestHeader("Content-Type", file.type)
    req.setRequestHeader("X-CSRF-Token", global.$csrfToken)
    req.send(file)
}

function deleteResource(url, cb) {
    var req = new XMLHttpRequest()

    req.onreadystatechange = function() {
        if(req.readyState === 4) {
            if(req.status >= 200 && req.status < 300) {
                cb(null, req.responseText)
            } else {
                cb(req.status, req.responseText)
            }
        }
    }

    req.open("DELETE", url, true)
    req.setRequestHeader("X-CSRF-Token", global.$csrfToken)
    req.send()
}

module.exports = {
    getResource,
    putResourceJson,
    postResourceJson,
    postResourceFile,
    deleteResource
}
