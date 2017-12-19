"use strict"

const dom = require('../dom.js')
const search = require('../search')

class Menu extends require("./menubar.js") {
    constructor(project, domElement, ref, callbacks) {
        super(project, domElement, ref, callbacks)

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
}

module.exports = Menu
