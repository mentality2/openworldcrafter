#!/usr/bin/env node

"use strict"

/*
    Compiles all of the markdown doc files into HTML files.
*/

const fs = require('fs')
const path = require('path')
const markdownit = require('markdown-it')

const md = new markdownit()
md.use(require("markdown-it-emoji"))
md.use(require("markdown-it-container"), "spoiler", require("../src/markdown").spoilerArgs)
md.use(require("markdown-it-container"), "headercontainer")

const jumpToTop = ``

var rootdir = path.join(__dirname, "..", "docs")

var template = fs.readFileSync(path.join(__dirname, "docs_template.htm"), "utf-8")
var indexFile = require(path.join(rootdir, "userdocs", "index.json"))

var index = "<div>", docs = ""

for(var page of indexFile) {
    if(page.indexOf("#") === 0) {
        index += `</div><div class="docs-index-section"><h2>${ page.substr(1) }</h2>`
    } else {
        var slug = page.replace(/ /g, "_").toLowerCase()
        index += `<a href="#${ slug }">${ page }</a>`

        var pageContents = fs.readFileSync(path.join(rootdir, "userdocs", slug + ".md"), "utf-8")
        pageContents = pageContents.replace(/!\[(.*)\]\((.*)\)/g, `![$1](screenshots/theme_light/$2)`)
        var htmlContents = md.render(pageContents)
        docs += `<div id="docs-${ slug }" class="docs-section"><h1>${ page }<a href="#top" class="docs-top-link" name="${ slug }">&#9650;</a></h1>${ htmlContents }</div>`
    }
}

index += "</div>"

template = template.replace("$docs", docs).replace("$index", index)
fs.writeFileSync(path.join(__dirname, "..", "resources", "docs", "index.htm"), template)
