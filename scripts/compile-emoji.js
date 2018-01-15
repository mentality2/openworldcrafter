#!/usr/bin/env node

// this took a surprising amount of effort to get right

"use strict"

const fs = require('fs')
const path = require('path')

var dir = process.argv[2]

var list = fs.readdirSync(dir)

var count = 0

var rows = 32

var outputSVG = ""
var outputCSS = `.emoji{background-size:${rows}em auto;display:inline-block;height:1em;width:1em}`
var emojiList = []

for(var file of list) {
    var chars = file.match(/^emoji_u([0-9a-f_]+)\.svg$/)[1].split("_")
    for(var char in chars) {
        chars[char] = parseInt(chars[char], 16)
    }
    var emoji = String.fromCodePoint(...chars)
    emojiList.push(emoji)

    var svg = fs.readFileSync(path.join(dir, file), "utf8").trim()
    svg = svg.replace(`<svg width="128" height="128" style="enable-background:new 0 0 128 128;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`, `<svg x="${ (count % rows) * 128 }" y="${ Math.floor(count / rows) * 128 }" width="128" height="128">`)
    svg = svg.replace(/SVGID_([0-9]+)_/g, `s${ count.toString(16) }_$1`)
    svg = svg.replace(/XMLID_([0-9]+)_/g, `x${ count.toString(16) }_$1`)
    svg = svg.replace(/class="st([0-9]+)"/g, `class="t${ count.toString(16) }_$1"`)
    svg = svg.replace(/\.st([0-9]+)/g, `.t${ count.toString(16) }_$1`)

    emoji = emoji.replace("\\.", "dot").replace("#", "pound").replace("*", "asterisk")
    outputCSS += `.e${ emoji }{background-position:-${(count % rows)}em -${Math.floor(count / rows)}em}`

    outputSVG += svg

    console.log(count, emoji, (count % rows) * 128, Math.floor(count / rows) * 128)

    count ++
}

outputSVG = `<svg height="${ (Math.ceil(count / rows) * 128) }" width="${ rows * 128 }" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${ outputSVG }</svg>`

fs.writeFileSync("resources/emoji/noto_emoji_spritesheet.svg", outputSVG)
fs.writeFileSync("resources/emoji/noto_emoji_spritesheet.css", outputCSS)
// fs.writeFileSync("resources/emoji/emojilist.json", JSON.stringify(emojiList))
