"use strict"

const escapeHtml = require('markdown-it/lib/common/utils').escapeHtml

function plugin(md, options) {
    md.renderer.rules.paragraph_open = function(tokens, idx, options, env, self) {
        var token = tokens[idx]

        // +1 to get to the paragraph's content
        if(tokens[idx + 1].content.trim()[0] === "!") {
            return `<p class="spoiler">`
        } else {
            return `<p>`
        }

    }
}

module.exports = {
    plugin
}
