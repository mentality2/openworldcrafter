"use strict"

const icons = require('../resources/icons')

// DOM editing helpers

function element(type, contents, classes) {
    var el = document.createElement(type)
    if(contents) el.textContent = contents
    if(classes) {
        if(typeof classes === "string") {
            el.classList.add(classes)
        } else {
            for(var cl of classes) el.classList.add(cl)
        }
    }

    return el
}

function modal(title) {
    var wrapper = div("", "modal-wrapper")
    var el = div("", "modal")

    var titleEl = div(title, "modal-title")
    el.appendChild(titleEl)

    wrapper.appendChild(el)

    var overlay = div("", "modal-overlay")
    overlay.onclick = event => {
        wrapper.classList.remove("modal-visible")
    }

    wrapper.addEventListener("click", event => event.stopPropagation())

    wrapper.appendChild(overlay)
    return {
        wrapper,
        modal: el,
        show: function() {
            wrapper.classList.add("modal-visible")
        },
        hide: function() {
            wrapper.classList.remove("modal-visible")
        },
        setTitle: function(newTitle) {
            titleEl.textContent = newTitle
        }
    }
}

function span(contents, classes) {
    return element("span", contents, classes)
}
function div(contents, classes) {
    return element("div", contents, classes)
}
function h1(contents, classes) {
    return element("h1", contents, classes)
}
function h2(contents, classes) {
    return element("h2", contents, classes)
}
function h3(contents, classes) {
    return element("h3", contents, classes)
}
function h4(contents, classes) {
    return element("h4", contents, classes)
}
function h5(contents, classes) {
    return element("h5", contents, classes)
}
function h6(contents, classes) {
    return element("h6", contents, classes)
}

function p(contents, classes) {
    return element("p", contents, classes)
}

function hr(classes) {
    return element("hr", undefined, classes)
}
function br() {
    return element("br")
}

function tr(row) {
    var r = element("tr")
    for(var data of row) {
        r.appendChild(element("td", data))
    }
    return r
}
function tr_headers(row) {
    var r = element("tr")
    for(var data of row) {
        r.appendChild(element("th", data))
    }
    return r
}

function table(headers, rows) {
    var t = element("table")

    t.appendChild(tr_headers(headers))

    if(rows) {
        for(var row of rows) {
            t.appendChild(tr(row))
        }
    }

    return t
}

function inputText(value, placeholder, classes) {
    var input = element("input", null, classes)
    if(value) input.value = value
    if(placeholder) input.placeholder = placeholder
    return input
}

function propertyTable(object) {
    var t = element("table")

    for(var key in object) {
        var tr = element("tr")
        tr.appendChild(element("td", key))
        tr.appendChild(element("td", object[key]))
        t.appendChild(tr)
    }

    return t
}

// WARNING: Text is NOT sanitized!
function button(icon, text, listener, classes) {
    var b = element("button", null, classes)
    b.classList.add("button")

    if(icon && text) {
        b.innerHTML = icons[icon] + " " + text
    }
    else if(icon) b.innerHTML = icons[icon]
    else b.textContent = text

    b.addEventListener("click", listener)

    return b
}

function input(type, value, onchange, classes) {
    var i = element("input", null, classes)

    i.type = type
    i.value = value
    if(onchange) i.addEventListener("change", onchange)

    return i
}

module.exports = {
    input, button, element, span, div, h1, h2, h3, h4, h5, h6, table, hr, br, p,
    tr, tr_headers, propertyTable, modal, inputText
}
