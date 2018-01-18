"use strict"

const dom = require('../dom')
const thispackage = require('../../package.json')

function createAboutModal() {
    var el = dom.modal()

    el.appendChild(dom.icon("openworldcrafter_full", ["fullwidth", "height-unset", "no-fill-or-stroke", "no-margin-bottom"]))
    if($owf.buildType) {
        var build = thispackage.buildinfo[$owf.buildType]
        if(build) {
            el.appendChild(dom.span(`v${ thispackage.version } build ${$owf.buildType}-${ thispackage.buildinfo.app.buildnumber } created ${thispackage.buildinfo.app.datestring }`))
        } else {
            el.appendChild(dom.span(`v${ thispackage.version }`))
        }
    } else {
        el.appendChild(dom.span(`v${ thispackage.version }`))
    }

    var docs = dom.div(undefined, "about-line")
    docs.appendChild(dom.icon("help", ["margin-right-20px"]))
    docs.appendChild(dom.span("Documentation"))
    docs.addEventListener("click", () => {
        $owf.showDocs("index")
    })

    var website = dom.div(undefined, "about-line")
    website.appendChild(dom.icon("openworldcrafter", ["margin-right-20px", "no-fill-or-stroke"]))
    website.appendChild(dom.span("Website"))
    website.addEventListener("click", () => {
        $owf.showWebpage("https://openworldcrafter.github.io/")
    })

    var github = dom.div(undefined, "about-line")
    var octocatIcon = localStorage["openworldcrafter.preferences.theme"] === "theme_dark" ? "octocat_dark" : "octocat_light"
    github.appendChild(dom.icon(octocatIcon, ["margin-right-20px", "no-fill-or-stroke"]))
    github.appendChild(dom.span("GitHub"))
    github.addEventListener("click", () => {
        $owf.showWebpage("https://github.com/openworldcrafter")
    })

    var license = dom.div(undefined, "about-line")
    license.appendChild(dom.icon("legal", "margin-right-20px"))
    license.appendChild(dom.span("License & Legal"))
    license.addEventListener("click", () => {
        $owf.showLicense()
    })

    el.appendChild(docs)
    el.appendChild(website)
    el.appendChild(github)
    el.appendChild(license)

    return el
}

module.exports.createAboutModal = createAboutModal
