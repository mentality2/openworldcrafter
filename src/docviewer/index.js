"use strict"

const fs = require('fs')
const path = require('path')
const markdownit = require('markdown-it')
const dom = require('../dom.js')
const theme = require('../theme.js')

const md = new markdownit()
md.use(require("markdown-it-emoji"))
md.use(require("markdown-it-container"), "spoiler", require("../markdown").spoilerArgs)

// each history state needs a different page name
var counter = 0

function readPage(page, cb) {
    fs.readFile(page, "utf8", (err, contents) => {
        if(err) {
            cb("# Error: Page Not Found")
        } else {
            cb(contents)
        }
    })
}

function constructPage(container, page, contents, newWindow, ignoreHistory) {
    if(!ignoreHistory) window.history.pushState({ page, contents, newWindow }, "Documentation", `${counter ++}`)

    theme.setTheme()

    container.innerHTML = md.render(contents)

    // change image links to be relative to the page
    var images = container.querySelectorAll("img")
    for(var image of images) {
        // use getAttribute because image.src gives an absolute path, while this returns a raw value
        var p = path.join(page, "..", image.getAttribute("src"))
        // use screenshots from the right theme. The markdown files all use the light theme by default.
        image.src = p.replace("screenshots/theme_light", "screenshots/" + (localStorage["openworldfactory.preferences.theme"] || "theme_dark"))
    }

    var links = container.querySelectorAll("a")
    for(let link of links) {
        link.addEventListener("click", event => {
            event.preventDefault()

            var href = link.getAttribute("href")

            if(/[a-z]+:/i.test(href)) {
                // external URL
                $owf.showWebpage(href)
            } else {
                // relative URL to more docs

                var newPage = path.join(page, "..", href)
                if(newWindow) {
                    // open in a new window using $owf
                    $owf.showDocs(href)
                } else {
                    readPage(newPage, contents => {
                        constructPage(container, newPage, contents, newWindow)
                    })
                }
            }
        })
    }
}

function createPage(el, page, newWindow) {
    var container = dom.div("", "markdown")

    window.addEventListener("popstate", event => {
        if(event.state) {
            constructPage(container, event.state.page, event.state.contents, event.state.newWindow, true)
        }
    })

    var pageLoc = path.resolve(__dirname, "..", "..", "docs", page)

    readPage(pageLoc, contents => {
        constructPage(container, pageLoc, contents, newWindow)
        el.appendChild(container)
    })
}

module.exports = createPage
