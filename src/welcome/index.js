"use strict"

const dom = require('../dom.js')
const theme = require('../theme.js')
const tabs = require('../tabs')
const newproject = require('./newproject.js')
const login = require('./login.js')
const project = require('../project')
const markdownit = require('markdown-it')
const fs = require('fs')
const path = require('path')
const docviewer = require('../docviewer')
const disk = require('../api/disk.js')
const electron = require('electron')
const update = require('./update')
const thispackage = require("../../package.json")

function createPage(el) {
    theme.setTheme()

    var main = dom.div("", ["column", "float-left", "welcome"])

    // New/Open Toolbar
    var toolbar = dom.div()

    var open = dom.button("", "Open\u2026", () => {
        try {
            electron.remote.dialog.showOpenDialog({
                title: "Open Project",
                properties: ["openFile"]
            }, filenames => {
                $owf.openProject(filenames[0], err => {
                    errModalMessage.textContent = err
                    errModal.show()
                })
            })
        } catch(e) {
            // TODO: Visible error message
            console.log("Error opening project!", e)
        }
    })

    toolbar.appendChild(open)

    var newProject = dom.button("add", "New\u2026", () => {
        newProjectModal.wrapper.classList.add("modal-visible")
    })
    toolbar.appendChild(newProject)

    if(process.env.NODE_ENV === "development") {
        var newProject = dom.button(undefined, "Remake test.owf", () => {
            newproject.remakeTestProject()
        })
        toolbar.appendChild(newProject)
    }

    var newProjectModal = newproject()
    main.appendChild(newProjectModal.wrapper)

    var errModal = dom.modal("Error Opening Project")
    var errModalMessage = dom.div("The project couldn't be loaded. It might be corrupt, or it might have been deleted or moved.")
    errModal.modal.appendChild(errModalMessage)
    var errModalActions = dom.div(undefined, "modal-actions")
    errModalActions.appendChild(dom.button(undefined, "Cancel", () => errModal.hide()))
    errModal.modal.appendChild(errModalActions)
    main.appendChild(errModal.wrapper)

    // Recent files
    var recentJSON = localStorage["openworldfactory.recentFiles"]
    var recentList = dom.element("ul", undefined, "margin-right")
    if(recentJSON) {
        var recent = JSON.parse(recentJSON)
        for(let file of recent) {
            var name = dom.element("a", file.name, "project-title")
            name.addEventListener("click", event => {
                $owf.openProject(file.location, err => {
                    errModalMessage.textContent = err
                    errModal.show()
                })
            })

            var item = dom.element("li")
            item.appendChild(name)
            if(file.desc) item.appendChild(dom.div(file.desc, "project-description"))

            recentList.appendChild(item)
        }
    } else {
        recentList.appendChild(dom.span("No recent files"))
    }

    main.appendChild(dom.h1("Welcome"))
    main.appendChild(toolbar)
    main.appendChild(recentList)

    var docsContainer = dom.div("", ["column", "float-right"])

    var updateMessage = dom.div(undefined, ["highlighted-message", "invisible", "margin-bottom"])
    docsContainer.appendChild(updateMessage)
    if(process.env.NODE_ENV === "development") {
        // no need to check for updates, but we'll put an extra devmode notice
        updateMessage.appendChild(dom.div("Development Mode Notice", "bold"))
        updateMessage.appendChild(dom.div("You are running openworldfactory in development mode."))
        updateMessage.classList.remove("invisible")
    } else {
        // gets the latest package.json from github
        update(pkg => {
            if(pkg.version !== thispackage.version) {
                updateMessage.appendChild(dom.button("download", "Go to Download", () => {
                    if(pkg.updateInfo && pkg.updateInfo.url) {
                        $owf.showWebpage(pkg.updateInfo.url)
                    } else {
                        $owf.showWebpage("https://openworldfactory.github.io")
                    }
                }, ["float-right"]))
                    updateMessage.appendChild(dom.div("Update to v" + pkg.version, "bold"))
                    updateMessage.appendChild(dom.div(pkg.updateInfo ? pkg.updateInfo.message : "An update is available."))
                updateMessage.classList.remove("invisible")
            }
        })
    }

    var docs = dom.div()
    docsContainer.appendChild(docs)
    docviewer(docs, "welcome.md", true)

    var container = dom.div()
    container.appendChild(main)
    container.appendChild(docsContainer)
    el.appendChild(container)
}

module.exports = createPage
