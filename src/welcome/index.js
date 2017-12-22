"use strict"

const dom = require('../dom.js')
const theme = require('../theme.js')
const newproject = require('./newproject.js')
const deleteproject = require('../modals/deleteproject')
const devicelogin = require('../modals/devicelogin.js')
// const docviewer = require('../docviewer')
const thispackage = require("../../package.json")
const utils = require('../utils')

function createProjectList(ul) {
    utils.removeAllChildren(ul)
    $owf.aggregateProjectLists(list => {
        if(list.length === 0) {
            recentList.appendChild(dom.span("No recent files"))
        }

        for(let file of list) {
            var item = dom.element("li")

            var name = dom.element("a", file.name, "project-title")
            name.addEventListener("click", event => {
                file.$getApi().openProject(file.location, err => {
                    $owf.handleError("Error Opening Project", err)
                })
            })
            item.appendChild(name)

            var more = dom.span(undefined, ["menu", "float-right", "menu-extends-left"])
            var moreIcon = dom.icon("more", "menu-button")
            var moreMenu = dom.div(undefined, "menu-content")
            var menuEmpty = true

            if(file.$getApi().deleteProject) {
                menuEmpty = false
                var deleteButton = dom.button(undefined, "Delete", () => {
                    var deleteModal = deleteproject(file.$getApi(), file.location, file.name, cb => {
                        createProjectList(ul)
                    })
                    deleteModal.addToContainer()
                    deleteModal.show()
                }, "nobutton")

                moreMenu.appendChild(deleteButton)
            }

            more.appendChild(moreIcon)
            more.appendChild(moreMenu)

            if(!menuEmpty) item.appendChild(more)

            if($owf.availableAPIs.length > 1) {
                if(file.$getApi().buttonIcon) {
                    var iconWrapper = dom.span(undefined, "float-right")
                    var icon = dom.icon(file.$getApi().buttonIcon)
                    iconWrapper.appendChild(icon)
                    item.appendChild(iconWrapper)
                }
            }

            if(file.desc) {
                item.appendChild(dom.div(file.desc, "project-description"))
            }

            ul.appendChild(item)
        }
    })
}

function createPage(el) {
    // Prevent changing URL by drag and drop
    window.addEventListener("dragover", e => {
        if(e) e.preventDefault()
    }, false)
    window.addEventListener("drop", e => {
        if(e) e.preventDefault()
    }, false)

    // change this back from editor settings
    document.documentElement.style.overflow = "initial"
    document.body.style.overflow = "initial"

    theme.setTheme()
    if($owf.mobile) document.body.classList.add("mobile")

    var main = dom.div("", ["column", "float-left", "welcome"])

    // New/Open Toolbar
    var toolbar = dom.div()

    if($owf.showOpenDialog) {
        var open = dom.button("", "Open\u2026", () => {
            $owf.showOpenDialog()
        })
        toolbar.appendChild(open)
    }

    var newProject = dom.button("add", "New\u2026", () => {
        newProjectModal.wrapper.classList.add("modal-visible")
    })
    toolbar.appendChild(newProject)

    var newProjectModal = newproject()
    main.appendChild(newProjectModal.wrapper)

    // Recent files
    var recentList = dom.element("ul", undefined, "margin-right")
    createProjectList(recentList)

    main.appendChild(dom.h1("Projects"))
    main.appendChild(toolbar)
    main.appendChild(recentList)

    var docsContainer = dom.div("", ["column", "float-right"])

    var updateMessage = dom.div(undefined, ["highlighted-message", "invisible", "margin-bottom"])
    docsContainer.appendChild(updateMessage)
    if(process.env.NODE_ENV === "development") {
        // no need to check for updates, but we'll put an extra devmode notice
        updateMessage.appendChild(dom.div("Development Mode Notice", "bold"))
        updateMessage.appendChild(dom.div("You are running openworldfactory in development mode."))
        updateMessage.appendChild(dom.button(undefined, "Use Mobile Env", () => $owf.mobile = true))
        updateMessage.classList.remove("invisible")

        if($owf.remakeTestProject) {
            var newProject = dom.button(undefined, "Remake test.owf", () => {
                $owf.remakeTestProject()
            })
            updateMessage.appendChild(newProject)
        }

        var loginOnline = dom.button(undefined, "Log In Online", () => {
            var deviceLoginModal = devicelogin.createDeviceLoginModal()
            deviceLoginModal.addToContainer()
            deviceLoginModal.show()
        })
        updateMessage.appendChild(loginOnline)
    } else {
        // gets the latest package.json from github
        if($owf.checkUpdate) {
            $owf.checkUpdate(pkg => {
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
    }

    var docs = dom.div()
    docsContainer.appendChild(docs)
    // docviewer(docs, "welcome.md", true)

    var container = dom.div()
    container.appendChild(docsContainer)
    container.appendChild(main)
    el.appendChild(container)
}

module.exports = createPage
