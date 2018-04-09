"use strict"

const byteSuffix = ["bytes", "kb", "mb", "gb", "tb", "pb", "eb", "zb", "yb"]
const colors = ["black", "gray", "maroon", "red", "fuchsia", "purple", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua", "orange", "transparent"]

function compareVersions(v1, v2) {
    var v1p = v1.split(".")
    var v2p = v2.split(".")

    if(v1p.length !== 3 || v2p.length !== 3) throw "these are not version numbers!"

    if(parseInt(v1p[0]) < parseInt(v2p[0])) return -1
    if(parseInt(v1p[0]) > parseInt(v2p[0])) return  1

    if(parseInt(v1p[1]) < parseInt(v2p[1])) return -1
    if(parseInt(v1p[1]) > parseInt(v2p[1])) return  1

    if(parseInt(v1p[2]) < parseInt(v2p[2])) return -1
    if(parseInt(v1p[2]) > parseInt(v2p[2])) return  1

    return 0
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(val, max))
}

function removeAllChildren(domElement) {
    while(domElement.firstChild) {
        domElement.lastChild.remove()
    }
}

function bytesText(num) {
    var suffix = 0
    while(num > 1000) {
        suffix ++
        num /= 1000
    }
    return `${Math.round(num * 100) / 100} ${byteSuffix[suffix]}`
}

const defaultCalendar = {
    months: [["January", 31], ["February", 28], ["March", 31], ["April", 30],
     ["May", 31], ["June", 30], ["July", 31], ["August", 31], ["September", 30],
     ["October", 31], ["November", 30], ["December", 31]]
}

const timesOfDay = {
    A: "After Midnight",
    B: "Sunrise",
    C: "Early Morning",
    D: "Late Morning",
    E: "Noon",
    F: "Early Afternoon",
    G: "Late Afternoon",
    H: "Evening",
    I: "Sunset",
    J: "After Sunset",
    K: "Before Midnight",
    L: "Midnight"
}

function formatTime(time, cal) {
    var parts = time.split(" ")

    var year = parts[0]
    var month = parts[1]
    var day = parts[2]

    var date = `${day} ${cal[parseInt(month) - 1][0]} ${year}`

    if(parts.length > 3) {
        if(parts.length === 4) {
            var timeofday = parts[3]
            date += ` ${timesOfDay[timeofday]}`
        } else {
            var hour = parts[3]
            var minute = parts[4]
            if(minute < 10) minute = "0" + minute
            date += ` ${hour}:${minute}`
        }
    }

    return date
}

function getDateField(date, field) {
    var fields = date.split(" ")
    switch(field) {
        case "day":
            return parseInt(fields[2])
        case "month":
            return parseInt(fields[1])
        case "year":
            return parseInt(fields[0])
        case "hour":
            if(fields.length === 5) return parseInt(fields[3])
            else return 0
        case "minute":
            if(fields.length === 5) return parseInt(fields[4])
            else return 0
        case "timeofday":
            if(fields.length === 4) return fields[3]
            else if(fields.length === 5) return "exactTime"
            else if(fields.length === 3) return "allDay"
            else return 0
        default:
            return 0
    }
}
function setDateField(date, field, val) {
    var fields = date.split(" ")
    switch(field) {
        case "day":
            fields[2] = val
            break
        case "month":
            fields[1] = val
            break
        case "year":
            fields[0] = val
            break
        case "hour":
            fields[3] = clamp(val, 0, 23)
            break
        case "minute":
            fields[4] = clamp(val, 0, 59)
            break
        case "timeofday":
            fields[3] = val
            delete fields[4]
            break
        case "allday":
            delete fields[3]
            delete fields[4]
            break
        default:
            throw `There is no field ${field} in a date; setDateField(${date}, ${field}, ${val})`
    }

    return fields.join(" ").trim()
}

function queryParams() {
    var params = {}

    if(location.search) {
        var parts = location.search.substring(1).split('&')

        for (var i = 0; i < parts.length; i++) {
            var nv = parts[i].split('=')
            if (!nv[0]) continue
            params[nv[0]] = decodeURIComponent(nv[1]) || true
        }
    }

    return params
}

const timeSortOrder = [
    "allDay",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
    "exactTime"
]

function compareDates(d1, d2) {
    if(getDateField(d1, "year") > getDateField(d2, "year")) return 1
    if(getDateField(d1, "year") < getDateField(d2, "year")) return -1

    if(getDateField(d1, "month") > getDateField(d2, "month")) return 1
    if(getDateField(d1, "month") < getDateField(d2, "month")) return -1

    if(getDateField(d1, "day") > getDateField(d2, "day")) return 1
    if(getDateField(d1, "day") < getDateField(d2, "day")) return -1

    var order1 = timeSortOrder.indexOf(getDateField(d1, "timeofday"))
    var order2 = timeSortOrder.indexOf(getDateField(d2, "timeofday"))

    if(order1 > order2) return 1
    if(order1 < order2) return -1
    if(order1 === order2 && getDateField(d1, "timeofday") !== "exactTime") return 0

    if(getDateField(d1, "hour") > getDateField(d2, "hour")) return 1
    if(getDateField(d1, "hour") < getDateField(d2, "hour")) return -1

    if(getDateField(d1, "minute") > getDateField(d2, "minute")) return 1
    if(getDateField(d1, "minute") < getDateField(d2, "minute")) return -1

    return 0
}

const acceptableSubobjects = {
    "projroot": [
        "note",
        "character",
        "timeline"
    ],
    "folder": [
        "note",
        "character",
        "timeline"
    ],
    "note": [
        "note",
        "character",
        "timeline"
    ],
    "event": [
        "note",
        "character",
        "timeline"
    ],
    "timeline": ["event"],
    "tagfolder": ["tag"],
}

function goToPage(name) {
    var a = document.createElement("a")
    a.href = name
    document.body.appendChild(a)
    a.click()
}

/*
    Changes to the editor page
*/
function launchEditor(file, api) {
    goToPage(`editor.htm?file=${ encodeURIComponent(file) }&api=${ encodeURIComponent(api) }`)
}

module.exports = {
    bytesText, formatTime, removeAllChildren, defaultCalendar, getDateField,
    setDateField, timesOfDay, queryParams, compareDates, acceptableSubobjects,
    compareVersions, colors, goToPage, launchEditor
}
