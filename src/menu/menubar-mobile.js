"use strict"

const dom = require('../dom.js')
const search = require('../search')

class MobileMenu extends require("./menubar.js") {
    constructor(project, domElement, ref, callbacks) {
        super(project, domElement, ref, callbacks)

        this._treeButton = dom.button("tree", undefined, callbacks.toggleTreeView, ["mobile-visible", "nobutton", "treeview-button"])
        this._dom.appendChild(this._treeButton)
    }

    addSearchBar(project, ref) {
        var searchbar = search.createSearchBar(project, page => {
            ref.goToPage(page)
            toggle()
        })
        this._dom.appendChild(searchbar)

        var searchInput = searchbar.querySelector(".searchbar-box")
        function toggle(val) {
            // only focus the searchbar if we're showing the searchbar and not
            // hiding it
            if(searchbar.classList.toggle("searchbar-shown")) {
                // if the timeout isn't set, strange things happen because the focus
                // occurs during the transition
                setTimeout(() => searchInput.focus(), 160)
            } else {
                searchbar.blur()
            }
            searchButton.classList.toggle("invisible")
        }

        var leaveSearch = dom.button("exit", undefined, () => {
            toggle()
        }, ["nobutton", "leavesearch"])
        searchbar.appendChild(leaveSearch)

        var searchButton = dom.button("search", undefined, () => {
            toggle()
        }, ["searchbar-button", "nobutton"])
        this._dom.appendChild(searchButton)
    }

    addTopMenu(name, displayName) {
        if(!this._topMenu) {
            var el = dom.div(undefined, "menubar-top")

            var btn = dom.div(displayName, "menubar-top-btn")
            var menuContent = this._topMenu = dom.div(undefined, "menubar-top-content")

            el.appendChild(btn)
            el.appendChild(menuContent)

            var content = dom.div()
            menuContent.appendChild(content)

            this._dom.appendChild(el)
        } else {
            var el = dom.div()

            var btn = dom.span(displayName, "menubar-top-header")

            var content = dom.div()

            el.appendChild(btn)
            el.appendChild(content)

            this._topMenu.appendChild(el)
        }

        this._menus[name] = {
            name: displayName,
            subitems: [],
            dom: {
                el, btn, content
            }
        }
    }
}

module.exports = MobileMenu
