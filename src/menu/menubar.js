"use strict"

const dom = require('../dom')
const search = require('../search')

class Menubar {
    constructor(project, domElement, ref, callbacks) {
        this._dom = domElement
        this._menus = {}
    }

    addSearchBar(project, ref) {
        var searchbar = search.createSearchBar(project, ref.goToPage)
        this._dom.appendChild(searchbar)
    }

    renameTopMenu(name, displayName) {
        if(!this._menus[name]) return
        this._menus[name].dom.btn.textContent = displayName
    }

    addSeparator(menu) {
        this._menus[menu].dom.content.appendChild(dom.element("hr"))
    }

    addMenuItem(top, name, callback) {
        var item = dom.element("a", name)
        item.className = "menubar-top-content-link"
        item.onclick = () => {
            // call the callback
            callback()
        }

        this._menus[top].dom.content.appendChild(item)
    }

    addMenuLink(top, name, href) {
        var item = dom.element("a", name)
        item.className = "menubar-top-content-link extref"
        item.addEventListener("click", () => {
            $owf.showWebpage(href)
        })

        this._menus[top].dom.content.appendChild(item)
    }
}

module.exports = Menubar
