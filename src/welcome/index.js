"use strict"

const dom = require('../dom.js')
const theme = require('../theme.js')
const newproject = require('./newproject.js')
const deleteproject = require('../modals/deleteproject')
const devicelogin = require('../modals/devicelogin.js')
// const docviewer = require('../docviewer')
const thispackage = require("../../package.json")
const utils = require('../utils')
const tips = require('./tips.json')
const feedbackModal = require('../modals/feedback.js')

var aboutModal = require('../modals/about.js').createAboutModal()

function createTip(updateMessage) {
    if(localStorage["openworldcrafter.preferences.hidetips"] !== "true" && Math.random() < .75) {
        // if there's no updates or dev mode notice, add a tip sometimes
        var tip = tips[Math.floor(Math.random() * tips.length)]
        if(!tip.disabled) {
            updateMessage.appendChild(dom.span("Tip: ", "bold"))
            updateMessage.appendChild(dom.span(tip.text))
            if(tip.link) {
                var tipLink = dom.element("a", " " + tip.link[0])
                if(tip.link[1] === "web") {
                    tipLink.addEventListener("click", ev => $owf.showWebpage(tip.link[2]))
                } else if(tip.link[1] === "docs") {
                    tipLink.addEventListener("click", ev => $owf.showDocs(tip.link[2]))
                } else if(tip.link[1] === "feedback")
                    tipLink.addEventListener("click", ev => {
                        feedbackModal.createFeedbackModal().show()
                    })
                updateMessage.appendChild(tipLink)
            }
            updateMessage.classList.remove("invisible")
        }
    }
}

function createMoreMenu() {
    var more = dom.span(undefined, ["menu", "menu-extends-left"])
    var moreIcon = dom.icon("more", ["menu-button", "vertical-align-middle", "double-font"])
    var moreMenu = dom.div(undefined, ["menu-content"])

    var about = dom.div("About")
    about.addEventListener("click", () => {
        aboutModal.show()
    })

    var settings = dom.div("Settings")
    settings.addEventListener("click", () => {
        $owf.showSettings()
    })

    var documentation = dom.div("Documentation")
    documentation.addEventListener("click", () => {
        $owf.showDocs("index")
    })

    moreMenu.appendChild(about)
    moreMenu.appendChild(settings)
    moreMenu.appendChild(documentation)

    if($owf.logout) {
        var logout = dom.div("Log Out")
        logout.addEventListener("click", () => {
            $owf.logout()
        })
        moreMenu.appendChild(logout)
    }

    more.appendChild(moreIcon)
    more.appendChild(moreMenu)

    return more
}

function createProjectList(ul, searchTerm) {
    if(searchTerm) searchTerm = searchTerm.toUpperCase()

    utils.removeAllChildren(ul)
    $owf.aggregateProjectLists(list => {
        if(list.length === 0) {
            ul.appendChild(dom.span("No recent files"))
        }

        for(let file of list) {
            var item = dom.element("li")

            if(searchTerm) {
                if(file.name.toUpperCase().indexOf(searchTerm) < 0 && (!file.desc || file.desc.toUpperCase().indexOf(searchTerm) < 0)) {
                    continue;
                }
            }

            var name = dom.element("a", file.name, "project-title")
            function onclick() {
                utils.launchEditor(file.location, file.$apiName)
            }
            name.addEventListener("click", onclick)
            name.addEventListener("keyup", ev => {
                if(ev.keyCode === 13) onclick()
            })
            name.tabIndex = 0
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
                    deleteModal.show()
                }, "nobutton")

                moreMenu.appendChild(deleteButton)
            }

            more.appendChild(moreIcon)
            more.appendChild(moreMenu)

            if(!menuEmpty) item.appendChild(more)

            if(Object.keys($owf.availableAPIs).length > 1) {
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
    theme.setTheme()
    if($owf.mobile) document.body.classList.add("mobile")

    var main = dom.div("", ["column", "float-left", "welcome", "center-column"])

    // New/Open Toolbar
    // margin-top-3px to avoid clipping under the welcome bar
    var toolbar = dom.div(undefined, ["margin-top", "margin-sides-half", "margin-sides-half", "flexbox"])

    var search = dom.span(undefined, ["flexitem-wide", "padding-right-3px"])
    var searchInput = dom.inputText(undefined, "Search Projects", "fullwidth")
    searchInput.addEventListener("input", () => {
        createProjectList(recentList, searchInput.value)
    })
    search.appendChild(searchInput)
    toolbar.appendChild(search)

    if($owf.showOpenDialog) {
        var open = dom.button("", "Open\u2026", () => {
            $owf.showOpenDialog()
        })
        toolbar.appendChild(open)
    }

    if($owf.showUploadDialog) {
        var upload = dom.button("", "Upload\u2026", () => {
            $owf.showUploadDialog(() => {
                // called if there is more than one project uploaded
                createProjectList(recentList)
            })
        })
        toolbar.appendChild(upload)
    }

    var newProject = dom.button("add", "New\u2026", () => {
        newProjectModal.show()
    })
    toolbar.appendChild(newProject)

    var newProjectModal = newproject()

    // Recent files
    var recentList = dom.element("ul")
    createProjectList(recentList)

    var updateMessage = dom.div(undefined, ["highlighted-message", "invisible", "margin", "margin-sides-half"])

    var header = dom.div(undefined, ["welcome-menu", "margin-sides-half"])
    header.appendChild(createMoreMenu())
    header.appendChild(dom.h1("Welcome"))
    main.appendChild(header)
    main.appendChild(updateMessage)
    main.appendChild(toolbar)
    main.appendChild(recentList)

    // top message (update notice, tip, or devmode notice)
    if(process.env.NODE_ENV === "development") {
        // no need to check for updates, but we'll put an extra devmode notice
        updateMessage.appendChild(dom.div("Development Mode Notice", "bold"))
        updateMessage.appendChild(dom.div("You are running openworldcrafter in development mode."))
        updateMessage.appendChild(dom.button(undefined, "Use Mobile Env", () => ($owf.mobile = true, document.body.classList.add("mobile"))))
        updateMessage.classList.remove("invisible")

        if($owf.remakeTestProject) {
            var newProject = dom.button(undefined, "Remake test.owc", () => {
                $owf.remakeTestProject()
            })
            updateMessage.appendChild(newProject)
        }

        var loginOnline = dom.button(undefined, "Log In Online", () => {
            var deviceLoginModal = devicelogin.createDeviceLoginModal()
            deviceLoginModal.show()
        })
        updateMessage.appendChild(loginOnline)
    } else {
        // gets the latest package.json from github
        if($owf.checkUpdate) {
            $owf.checkUpdate(pkg => {
                if(utils.compareVersions(pkg.version, thispackage.version) > 0) {
                    updateMessage.appendChild(dom.button("download", "Go to Download", () => {
                        if(pkg.updateInfo && pkg.updateInfo.url) {
                            $owf.showWebpage(pkg.updateInfo.url)
                        } else {
                            $owf.showWebpage("https://openworldcrafter.com")
                        }
                    }, ["float-right"]))
                    updateMessage.appendChild(dom.div("Update to v" + pkg.version, "bold"))
                    updateMessage.appendChild(dom.div(pkg.updateInfo ? pkg.updateInfo.message : "An update is available."))
                    updateMessage.classList.remove("invisible")
                } else {
                    // no update, show a tip
                    createTip(updateMessage)
                }
            })
        } else {
            // mobile devices don't check for updates as that's the app store's
            // job. just show a tip
            createTip(updateMessage)
        }
    }

    el.appendChild(main)

    $placeholder.removePlaceholder()
}

module.exports = createPage
