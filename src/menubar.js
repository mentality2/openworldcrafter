"use strict"

const dom = require('./dom.js')
const search = require('./search')

class Menu {
    constructor(project, domElement) {
        this._dom = domElement
        this._menus = {}

        // the web version shows a menu with the display name instead, and this
        // is handled separately
        if($owf.showLogoInCorner) {
            var logo = dom.span("openworldfactory" + (process.env.NODE_ENV === "development" ? ":dev" : ""), ["logo", "cursor-pointer"])
            logo.addEventListener("click", () => {
                $owf.showWelcome()
            })
            this._dom.appendChild(logo)
        }
    }

    addSearchBar(project, ref) {
        var searchbar = search.createSearchBar(project, ref.goToPage)
        this._dom.appendChild(searchbar)
    }

    renameTopMenu(name, displayName) {
        if(!this._menus[name]) return
        this._menus[name].dom.btn.textContent = displayName
    }

    addTopMenu(name, displayName) {
        var el = dom.span()
        el.className = "menubar-top"

        var btn = dom.span(displayName)
        btn.className = "menubar-top-btn"

        var content = dom.div()
        content.className = "menubar-top-content"

        el.appendChild(btn)
        el.appendChild(content)

        this._menus[name] = {
            name: displayName,
            subitems: [],
            dom: {
                el, btn, content
            }
        }

        this._dom.appendChild(el)
    }

    addSeparator(menu) {
        this._menus[menu].dom.content.appendChild(dom.element("hr"))
    }

    addMenuItem(top, name, callback) {
        var item = dom.element("a", name)
        item.className = "menubar-top-content-link"
        item.onclick = callback

        this._menus[top].dom.content.appendChild(item)
    }

    addMenuLink(top, name, href) {
        var item = dom.element("a", name)
        item.className = "menubar-top-content-link extref"
        item.href = href

        this._menus[top].dom.content.appendChild(item)
    }
}

module.exports = Menu
