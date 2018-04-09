"use strict"

const menu = require('../menu')
const api = require('../api')
const project = require('../project')
const treeview = require('../treeview')
const tabs = require('../tabs')
const dom = require('../dom.js')
const projectsettings = require('../modals/projectsettings.js')
const about = require('../modals/about.js')
const utils = require('../utils')
const shortcuts = require('./shortcuts.js')

class Editable {
    constructor(project, tree) {
        this.dirty = false
        this.project = project
        this._tree = tree
    }

    save() {
        console.trace("Editable.save() is deprecated, use Project.save() instead")
        this.project.save(true)

        if(this.treeDirty) {
            this._tree.refresh()
            this.treeDirty = false
        }
     }

     upload(file, cb) {
         console.trace("Editable.upload() is deprecated, use Project.addAsset() instead")
         this.project.addAsset(file, cb)
     }
}

function createPage(el, proj) {
    // required for firefox/android to prevent page from scrolling
    // on android, this prevents the page from scrolling horizontally due to the
    // search bar. this is also why <html> is hidden along with <body>
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    var ref = {}

    var mainModalContainer = dom.div()
    mainModalContainer.id = "main-modal-container"
    el.appendChild(mainModalContainer)

    if($owf.mobile) document.body.classList.add("mobile")

    ref.changeProjectName = () => {
        ref.changeProjectNameInMenu()
        document.title = proj.info.name + " - openworldcrafter"
        proj.updateListing()
    }

    ref.project = proj
    document.title = proj.info.name + " - openworldcrafter"

    var projectInfo = projectsettings.createProjectSettingsModal(proj, ref)
    var aboutModal = about.createAboutModal()

    function goToPage(object, ignoreHistory) {
        tree.obj.setSelected(object, ignoreHistory)
    }
    ref.goToPage = goToPage
    function goToPageId(id, ignoreHistory) {
        tree.obj.setSelected(proj.getObjectById(id), ignoreHistory)
    }
    ref.goToPageId = goToPageId

    // // create sharing modal, if sharing is supported
    // if(proj.$store.getSharingSettings) {
    //     var sharingModal = sharing.createSharingModal(proj)
    //     document.body.appendChild(sharingModal.wrapper)
    //     document.body.appendChild(sharingModal.inviteModal.wrapper)
    // }

    var menubar = menu.createMainMenubar(proj, {
        projectInfo: projectInfo.show,
        print: () => window.print(),
        // share: (sharingModal ? sharingModal.show : undefined)
        toggleTreeView: () => tree.obj.isRevealed() ? tree.obj.conceal() : tree.obj.reveal(),
        about: () => aboutModal.show()
    }, ref)

    document.body.appendChild(projectInfo.wrapper)
    document.body.appendChild(menubar)

    proj.$saveListener = (errmsg, button, buttonAction) => {
        if(errmsg) {
            var saveErrorModal = dom.modal("Error Saving Project", true)
            saveErrorModal.modal.appendChild(dom.div(errmsg))
            saveErrorModal.okCancel(() => {
                if(buttonAction) buttonAction()
                saveErrorModal.hide()
            }, button)
            saveErrorModal.show()
        }

        tree.obj.refresh()
    }

    document.addEventListener("pause", () => proj.save())
    window.addEventListener("native.keyboardhide", e => document.body.classList.remove("keyboard-is-open"))
    window.addEventListener("native.keyboardshow", e => document.body.classList.add("keyboard-is-open"))

    var tree = treeview.createProjectFolderView(proj, ref)

    var editable = proj.isEditable() ? new Editable(proj, $owf.pid, tree.obj) : false
    ref.editable = editable

    var tabview = tabs.createTabArea(proj)

    ref.showNewObjectModal = () => { tree.obj.showNewObjectModal() }

    tree.obj.setSelectListener(object => {
        viewPage(object)
    })

    function viewPage(object, ignoreHistory) {
        tabview.obj.clearTabs()
        if(object) {
            tabs.createTabset(tabview.obj, object, ref)
            if(!ignoreHistory) history.pushState({ id: object.id }, object.name)
        }
    }

    window.addEventListener("popstate", event => {
        if(event.state && event.state.id) {
            goToPage(proj.getObjectById(event.state.id), true)
        }
    })

    window.addEventListener("beforeunload", event => {
        if(proj.isDirty()) {
            var res =  $owf.showExitConfirmation()
            event.returnValue = res
            if(res) event.preventDefault()
        }
        shortcuts.clearShortcuts()
    })

    var container = dom.div("", ["flexbox", "mainpanel"])

    tabview.el.classList.add("flexitem-wide")

    container.appendChild(tree.el)
    container.appendChild(tabview.el)

    shortcuts.clearShortcuts()
    shortcuts.createShortcut("s", () => proj.save())
    shortcuts.createShortcut("f", () => menubar.querySelector(".searchbar-box").focus())
    shortcuts.createShortcut("e", () => tabview.obj.toggleMode())

    el.appendChild(container)

    $placeholder.removePlaceholder()
}

module.exports = createPage
