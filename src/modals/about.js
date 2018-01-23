"use strict"

const dom = require('../dom')
const buildinfo = require('../buildinfo')
const feedbackModal = require('./feedback.js')

function createAboutModal() {
    var el = dom.modal()

    var iconDiv = dom.div(undefined, "no-margin-bottom")
    iconDiv.appendChild(dom.icon("openworldcrafter_full", ["fullwidth", "height-unset", "no-fill-or-stroke", "no-margin-bottom"]))
    el.appendChild(iconDiv)
    el.appendChild(dom.span(buildinfo.getBuildString()))

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
        $owf.showWebpage("https://openworldcrafter.com/")
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

    var feedback = dom.div(undefined, "about-line")
    feedback.appendChild(dom.icon("feedback", "margin-right-20px"))
    feedback.appendChild(dom.span("Feedback"))
    feedback.addEventListener("click", () => {
        feedbackModal.createFeedbackModal().show()
    })

    el.appendChild(docs)
    el.appendChild(website)
    el.appendChild(github)
    el.appendChild(license)
    el.appendChild(feedback)

    return el
}

module.exports.createAboutModal = createAboutModal
