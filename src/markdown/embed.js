"use strict"

const services = {
    Youtube: {
        regex: /^(?:https?):\/\/(?:www\.)?youtu.?be(?:\.com)?\/(?:(?:watch\?v=)|(?:embed\/)|(?:v\/)|(?:user\/\w+\/))?(.+)/,
        url: "https://youtube.com/embed/"
    },
    Vimeo: {
        regex: /(?:https:\/\/?)(?:player\.)?vimeo\.com\/(\d+)(?:$|\/)/,
        url: "https://player.vimeo.com/video/"
    },
}

function getCodeFromUrl(url) {
    for(var service in services) {
        if(services[service].regex.test(url)) {
            var id = url.match(services[service].regex)[1]

            return `<${$owf.iframeTag} frameborder="0" allowfullscreen src="${services[service].url}${id}" class="embedded-video embedded-video-${service}"></${$owf.iframeTag}>`
        }
    }
}

function plugin(md, options) {
    var oldImage = md.renderer.rules.image

    md.renderer.rules.image = function(tokens, idx, options, env, self) {
        var token = tokens[idx]
        var aIndex = token.attrIndex("src")
        var src = token.attrs[aIndex][1]

        var code = getCodeFromUrl(src)

        if(code) return code
        else return oldImage(tokens, idx, options, env, self)
    }
}

module.exports = {
    plugin, services, getCodeFromUrl
}
