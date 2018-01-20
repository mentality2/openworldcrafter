"use strict"

// see https://oembed.com/
function getOembedMetadata(oEmbedUrl, mediaUrl, cb) {
    var request = new XMLHttpRequest()
    cb = cb || (() => {})

    request.onload = () => {
        if(request.status >= 200 && request.status < 300) {
            cb(undefined, JSON.parse(request.responseText))
        } else {
            cb(request.status, request.responseText)
        }
    }
    request.onerror = err => {
        cb(err)
    }

    var requestURL = oEmbedUrl.replace("{format}", "json")
    requestURL += `?url=${ encodeURIComponent(mediaUrl) }&format=json`
    request.open("GET", requestURL, true)
    request.send()
}

const services = {
    Youtube: {
        regex: /^(?:https?):\/\/(?:(?:www|m)\.)?youtu.?be(?:\.com)?\/(?:(?:watch\?v=)|(?:embed\/)|(?:v\/)|(?:user\/\w+\/))?([A-Za-z0-9_\-]+)/,
        url: "https://youtube.com/watch?v=",
        oembed: "https://youtube.com/oembed"
    },
    Vimeo: {
        regex: /(?:https:\/\/?)(?:player\.)?vimeo\.com\/(\d+)(?:$|\/)/,
        url: "https://vimeo.com/",
        oembed: "https://vimeo.com/api/oembed.{format}"
    },
}

function getCodeFromUrl(url) {
    for(var service in services) {
        if(services[service].regex.test(url)) {
            var id = url.match(services[service].regex)[1]

            var code = `<a class="embedded-video embedded-video-placeholder" data-url="${services[service].url + id}" data-service="${service}">
            <img class="none"/><span><span class="embedded-video-title">Video</span><span class="embedded-video-author"></span></span></a>`
            return code
            // return `<${$owf.iframeTag} frameborder="0" allowfullscreen src="${services[service].url}${id}" class="embedded-video embedded-video-${service}"></${$owf.iframeTag}>`
        }
    }
}

// fills in the video details. this is necessary so that the markdown can be
// rendered without waiting for the oembed data request
// the argument is the embedded element
function fillEmbed(video) {
    let href = video.getAttribute("data-url")
    let service = services[video.getAttribute("data-service")]

    getOembedMetadata(service.oembed, href, (err, data) => {
        if(err) {
            video.querySelector(".embedded-video-title").textContent = "Error Finding Video"

            video.classList.remove("embedded-video-placeholder")
            video.classList.add("embedded-video-errored")
        } else {
            video.href = href
            video.querySelector("img").src = data.thumbnail_url
            video.querySelector(".embedded-video-title").textContent = data.title
            video.querySelector(".embedded-video-author").textContent = data.author_name

            video.classList.remove("embedded-video-placeholder")
        }
    })
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
    plugin, services, getCodeFromUrl, getOembedMetadata, fillEmbed
}
