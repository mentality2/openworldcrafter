"use strict"

const menubar = require('./menubar.js')
const theme = require('./theme.js')
const dom = require('./dom.js')

/**
 * Callbacks is an object containing several callbacks for various menu
 * functions.
 */
function createMainMenubar(project, callbacks, ref) {
    var el = dom.div(undefined, "main-menubar")
    var menu = new menubar(project, el)

    menu.addTopMenu("project", project.info.name)
    // menu.addMenuItem("project", "Save", project.save())
    menu.addMenuItem("project", "Print", callbacks.print)
    menu.addMenuItem("project", "Project Info...", callbacks.projectInfo)

    // menu.addTopMenu("media", "Media")
    // menu.addMenuItem("media", "View All...")
    // menu.addMenuItem("media", "Download...")

    menu.addTopMenu("view", "View")
    menu.addMenuItem("view", "Dark Theme", () => theme.changeTheme("theme_dark"))
    menu.addMenuItem("view", "Light Theme", () => theme.changeTheme("theme_light"))

    menu.addTopMenu("help", "Help")
    // menu.addMenuLink("help", "About", "https://example.com")
    // menu.addMenuLink("help", "Tutorials", "https://example.com")
    menu.addMenuItem("help", "Documentation", () => $owf.showDocs("userdocs/index.md"))

    menu.addSearchBar(project, ref)

    ref.changeProjectNameInMenu = () => menu.renameTopMenu("project", project.info.name)

    return el
}

module.exports = {
    createMainMenubar
}
