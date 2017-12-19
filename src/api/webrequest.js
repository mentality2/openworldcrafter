"use strict"

var csrfToken = undefined

// RM-BEFORE-FLIGHT
const origin = $owf.origin || ""

/*
 * All callbacks will be called with arguments (err, responseText)
 */

function getCsrfToken(cb) {
    if(csrfToken) cb(csrfToken)
    else {
        getResource("/csrf-token", (status, data) => {
            cb(data)
        })
    }
}

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

    req.open("GET", origin + url, true)
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

    getCsrfToken(csrf => {
        req.open("PUT", origin + url, true)
        req.setRequestHeader("Content-Type", "application/json")
        req.setRequestHeader("X-CSRF-Token", csrf)
        req.send(object)
    })
}

function postForm(url, fields, cb) {
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

    var fieldarray = []
    for(var field in fields) fieldarray.push(field + "=" + fields[field])
    var urlencoded = fieldarray.join("&")

    getCsrfToken(csrf => {
        req.open("POST", origin + url, true)
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        req.setRequestHeader("X-CSRF-Token", csrf)
        req.send(urlencoded)
    })
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

    req.open("POST", origin + url, true)
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


    getCsrfToken(csrf => {
        req.open("POST", origin + url, true)
        req.setRequestHeader("Content-Type", file.type)
        req.setRequestHeader("X-CSRF-Token", csrf)
        req.send(file)
    })
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

    getCsrfToken(csrf => {
        req.open("DELETE", origin + url, true)
        req.setRequestHeader("X-CSRF-Token", csrf)
        req.send()
    })
}

module.exports = {
    getResource,
    putResourceJson,
    postResourceJson,
    postResourceFile,
    deleteResource
}
