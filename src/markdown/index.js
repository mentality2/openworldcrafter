"use strict"

const markdownit = require('markdown-it')
const dom = require('../dom')
const uuidRegex = require('./links').uuidRegex
const embed = require('./embed')

const md = new markdownit()
md.use(require('markdown-it-emoji'))
md.use(require("./embed").plugin)
// md.use(require("./spoiler").plugin)
var spoilerArgs = {
    validate: params => params.trim() === "spoiler",
    render: (tokens, idx) =>  {
        if(tokens[idx].nesting === 1) {
            return '<blockquote class="spoiler">'
        } else {
            return '</blockquote>\n'
        }
    }
}
md.use(require("markdown-it-container"), "spoiler", spoilerArgs)

function rerender(el, text, ref) {
    el.innerHTML = md.render(text)

    // videos
    // this MUST be done before links
    var videos = el.querySelectorAll(".embedded-video-placeholder")
    for(let video of videos) {
        embed.fillEmbed(video)
    }

    // replace links
    var links = el.querySelectorAll("a")
    for(let link of links) {
        link.addEventListener("click", event => {
            event.preventDefault()

            var href = link.getAttribute("href")

            if(!href) {
                // well i guess we're not going anywhere
            } else if(uuidRegex.test(href)) {
                // go to the object with this id
                ref.goToPageId(href)
            } else if(!(/^[a-z]+:/i.test(href))) {
                $owf.showWebpage("https://" + href)
            } else {
                $owf.showWebpage(href)
            }
        })
    }
}

// renders stored markdown into DOM elements
function render(text, classes, ref) {
    var el = dom.span(undefined, classes)
    el.classList.add("markdown")

    rerender(el, text, ref)

    return el
}

// transforms stored markdown into editor markdown (changing link references, etc)
function edit(text) {
    return text
}

// transforms editor markdown into stored markdown
function store(text) {
    return text
}

module.exports = {
    rerender, render, edit, store, spoilerArgs
}
