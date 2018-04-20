"use strict"

var csrfToken = undefined

const origin = typeof process.env.OWC_ORIGIN !== "undefined" ? process.env.OWC_ORIGIN : "http://localhost:7701"

/*
 * All callbacks will be called with arguments (err, responseText)
 */

function sendRequest(method, url, contenttype, data, cb) {
    var request = new XMLHttpRequest()
    cb = cb || (() => {})

    request.onload = () => {
        if(request.status >= 200 && request.status < 300) {
            cb(undefined, request.responseText)
        } else {
            cb(request.status, request.responseText)
        }
    }
    request.onerror = err => {
        cb(err)
    }

    function send(csrf) {
        request.open(method, origin + url, true)

        if(csrf) request.setRequestHeader("X-CSRF-Token", csrf)
        if(contenttype) request.setRequestHeader("Content-Type", contenttype)

        try {
            request.send(data)
        } catch(err) {
            console.log("Network error", err)
            cb(err)
        }
    }

    // don't send the token on GET calls because this interferes with GETting
    // the CSRF token.
    if(method === "GET") send()
    else getCsrfToken(send, cb)
}

function getCsrfToken(cb, err) {
    if(csrfToken) cb(csrfToken)
    else {
        getResource("/csrf-token", (status, data) => {
            if(status) {
                // oops, error
                err(status)
            } else {
                cb(data)
            }
        })
    }
}

function attemptLogin(cb) {
    if(localStorage["openworldcrafter.device.name"]) {
        postResourceJson("/api/auth/login/device", {
            device: localStorage["openworldcrafter.device.uuid"],
            token: localStorage["openworldcrafter.device.token"]
        }, (err, loginres) => {
            if(err) cb(false)
            else cb(true)
        })
    } else cb(false)
}

function getResource(url, cb) {
    sendRequest("GET", url, undefined, undefined, cb)
}

function putResourceJsonText(url, object, cb) {
    sendRequest("PUT", url, "application/json", object, cb)
}

function postForm(url, fields, cb) {
    var fieldarray = []
    for(var field in fields) fieldarray.push(field + "=" + fields[field])
    var urlencoded = fieldarray.join("&")

    sendRequest("POST", url, "application/x-www-form-urlencoded", urlencoded, cb)
}

function postResourceJson(url, object, cb) {
    sendRequest("POST", url, "application/json", JSON.stringify(object), cb)
}

function postResourceFile(url, file, cb) {
    sendRequest("POST", url, file.type, file, cb)
}

function deleteResource(url, cb) {
    sendRequest("DELETE", url, undefined, undefined, cb)
}

module.exports = {
    getResource,
    putResourceJsonText,
    postResourceJson,
    postResourceFile,
    postForm,
    deleteResource,
    attemptLogin,
    origin
}
