"use strict"

const dom = require('../dom.js')
const icons = require('../../resources/icons')

function noop() {}

class TabArea {
    /**
     * note: project may be undefined (eg. tab area on welcome page)
     */
    constructor(domobj, project) {
        this._domobj = domobj
        domobj.classList.add("tab-wrapper")

        this._printNameHeader = dom.h1(undefined, "print-only")
        this._printName = ""
        this._domobj.appendChild(this._printNameHeader)

        var tabrow = dom.div()
        tabrow.classList.add("tabrow")
        this._domobj.appendChild(tabrow)
        this._tabrow = tabrow

        if(project && project.isEditable()) {
            var edit = dom.button("edit", "Edit", () => {
                this._domobj.classList.add("editing")
            }, ["button", "edit-invisible", "edit-button"])

            var save = dom.button("save", "Save", () => {
                project.save()
                this._domobj.classList.remove("editing")
            }, ["button", "edit-visible", "edit-button"])

            this._tabrow.appendChild(edit)
            this._tabrow.appendChild(save)
        }

        var container = dom.div()
        container.classList.add("tab-container")
        this._domobj.appendChild(container)
        this._container = container

        this._tabs = []

        this._selectListener = noop
    }

    _recalcPrintName() {
        var header = this._printName
        if(this._tabs[this._selectedIndex]) {
            if(this._tabs[this._selectedIndex].name !== this._printName) {
                header += " | " + this._tabs[this._selectedIndex].name
            }
        }
        this._printNameHeader.textContent = header
    }

    setPrintName(name) {
        this._printName = name
        this._recalcPrintName()
    }

    setSelectListener(func) {
        this._selectListener = func || noop
    }

    clearTabs() {
        for(var i in this._tabs) {
            this._tabs[i].el.remove()
            this._tabs[i].btn.remove()
        }

        this._tabs = []
        this._selectedIndex = 0
    }

    selectTab(index) {
        // hide previous tab
        if(this._tabs[this._selectedIndex]) {
            var prevTab = this._tabs[this._selectedIndex]
            prevTab.el.classList.remove("tab-visible")
            prevTab.btn.classList.remove("tabrow-button-selected")
        }

        // set selected tab index
        this._selectedIndex = index

        // make new tab visible
        var tab = this._tabs[index]
        tab.el.classList.add("tab-visible")
        tab.btn.classList.add("tabrow-button-selected")

        this._recalcPrintName()

        this._selectListener(index)
    }

    addTab(name, content) {
        var selected = false
        if(this._tabs.length === 0) {
            // first tab, should be selected
            selected = true
        }

        var index = this._tabs.length

        // create button for tabrow
        var btn = dom.span(name)
        btn.classList.add("tabrow-button")
        btn.onclick = () => {
            this.selectTab(index)
        }
        this._tabrow.appendChild(btn)

        // set up content element
        content.classList.add("tab")
        this._container.appendChild(content)

        // add tab info to list
        this._tabs.push({
            name, el: content, btn
        })

        if(selected) this.selectTab(0)
    }
}

module.exports = TabArea
