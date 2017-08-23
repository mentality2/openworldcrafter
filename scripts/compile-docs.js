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

function plugin(md, options) {
    var oldLink = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    }

    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
        var token = tokens[idx]
        var aIndex = token.attrIndex("href")
        token.attrs[aIndex][1] = token.attrs[aIndex][1].replace(/\.md$/, ".htm")

        return oldLink(tokens, idx, options, env, self)
    }
}
md.use(plugin)

var rootdir = path.join(__dirname, "..", "docs")

function compileDirectory(dir) {
    var list = fs.readdirSync(path.join(rootdir, dir))

    try {
        fs.mkdirSync(path.join(rootdir, "..", "dist", "docs", dir))
    } catch(e) { /* ignore */ }

    for(var file of list) {
        if(fs.statSync(path.join(rootdir, dir, file)).isDirectory()) {
            compileDirectory(path.join(dir, file))
        } else {
            if(/\.md$/.test(file)) {
                var newPath = path.join(rootdir, "..", "dist", "docs", dir, file.replace(/\.md$/, ".htm"))
                var contents = fs.readFileSync(path.join(rootdir, dir, file), "utf8")
                var title = contents.match(/(\# \!\[.*\]\(.*\)) (.*)/)[2]
                fs.writeFileSync(newPath, `<!DOCTYPE html>
<html>
    <head>
        <title>${title} | OpenWorldFactory</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

        <link rel="stylesheet" href="/dist/styles/theme_light.css" id="mainStylesheet" />
    </head>
    <body>
        <script>
            document.getElementById("mainStylesheet").href = "/dist/styles/" + (localStorage["openworldfactory.preferences.theme"] || "theme_light") + ".css"
        </script>
        <div class="markdown">` + md.render(contents) + `</div>
    </body>
</html>`)
            } else {
                var newPath = path.join(rootdir, "..", "dist", "docs", dir, file)
                var contents = fs.readFileSync(path.join(rootdir, dir, file))
                fs.writeFileSync(newPath, contents)
            }

        }
    }
}

compileDirectory(".")
