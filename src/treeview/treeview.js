"use strict"

const dom = require('../dom.js')
const utils = require('../utils.js')
const newobject = require('../modals/newobject.js')

function noop() {}

const downArrow = "\u25BC"
const rightArrow = "\u25B6"

class TreeView {
    constructor(domobj, rootobj, ref, opts) {
        this._dom = domobj
        this._ref = ref

        this._dom.addEventListener("click", event => {
            this.setSelected()
        })

        this._container = dom.div(null, "treeview-container")
        this._dom.appendChild(this._container)

        if(rootobj.$project.isEditable()) {
            this._toolbar = dom.div("", "toolbar")
            this._dom.appendChild(this._toolbar)

            this._addButton = dom.button("add", undefined, event => {
                event.stopPropagation()
                if(this._addButton.classList.contains("button-disabled")) return

                this.showNewObjectModal()
            })

            this._removeButton = dom.button("remove", null, event => {
                event.stopPropagation()
                if(this._removeButton.classList.contains("button-disabled")) return

                if(this._selected) {
                    var confirmDelete = dom.modal("Confirm Delete", true)
                    var deleteObject = this._selected.obj

                    var confirmDeleteText = `Are you sure you want to delete ${ deleteObject.name }`
                    if(Object.keys(deleteObject.subobjects).length) confirmDeleteText += " and anything in it?"
                    else if(deleteObject.type === "tag") confirmDeleteText += "? This will remove the tag from all other pages."
                    else confirmDeleteText += "?"

                    confirmDelete.appendChild(dom.div(confirmDeleteText))

                    confirmDelete.okCancel(event => {
                        this._selected.obj.$parent.removeChild(this._selected.obj.id)
                        confirmDelete.hide()

                        this.refresh()
                        this.setSelected()

                        rootobj.save(true)

                        event.stopPropagation()
                    }, "Delete")

                    confirmDelete.show()
                }
            }, "button-disabled")

            this._toolbar.appendChild(this._addButton)
            this._toolbar.appendChild(this._removeButton)
        }

        this._root = rootobj
        this._opts = JSON.parse(JSON.stringify(opts || {}))
        this._rowArray = {}

        if(!this._opts.prop_name) this._opts.prop_name = "name"
        if(!this._opts.prop_children) this._opts.prop_children = "subobjects"
        if(!this._opts.prop_id) this._opts.prop_id = "id"

        this._dom.className = "treeview"

        this._selectListener = noop

        this._expandedNodes = {}

        this.refresh()
        if($owf.mobile) this.reveal()
    }

    setSelectListener(func) {
        this._selectListener = func || noop
    }

    getSelected() {
        return this._selected ? this._selected.obj : undefined
    }

    getRootObj() {
        return this._root
    }

    setSelected(obj, ignoreHistory) {
        if(this._selected) {
            this._selected.el.classList.remove("treeview-item-selected")
        }

        if(obj) {
            var row = this._rowArray[obj.id]

            this._selected = {
                el: row,
                obj
            }

            row.classList.add("treeview-item-selected")

            this.conceal()
        } else {
            this._selected = null
        }

        this._selectListener(obj, ignoreHistory)

        var parentType = this._selected ? this._selected.obj.type : "folder"
        if(utils.acceptableSubobjects[parentType]) {
            this._addButton.classList.remove("button-disabled")
        } else {
            this._addButton.classList.add("button-disabled")
        }

        if(this._selected && this._selected.obj.$parent) {
            this._removeButton.classList.remove("button-disabled")
        } else {
            this._removeButton.classList.add("button-disabled")
        }
    }

    addChild(parentEl, obj) {
        var el = dom.div(null, ["treeview-item", "treeview-item-collapsed"])

        var arrow = dom.span(rightArrow, "padding-right-3px")

        function subobjectCount() {
            return Object.keys(obj.subobjects).length
        }
        var expand = () => {
            if(subobjectCount()) {
                el.classList.remove("treeview-item-collapsed")
                arrow.textContent = downArrow
                this._expandedNodes[obj.id] = true
            }
        }
        var collapse = () => {
            el.classList.add("treeview-item-collapsed")
            arrow.textContent = rightArrow
            delete this._expandedNodes[obj.id]
        }

        if(!subobjectCount()) {
            arrow.classList.add("hidden")
        }

        arrow.addEventListener("click", event => {
            event.stopPropagation()

            if(arrow.textContent === downArrow) collapse()
            else expand()
        })
        el.appendChild(arrow)

        // if the object was already expanded, keep it expanded
        if(this._expandedNodes[obj.id]) {
            expand()
        }

        var row = dom.span(obj[this._opts.prop_name])
        this._rowArray[obj.id] = row
        row.addEventListener("click", event => {
            event.stopPropagation()
            this.setSelected(obj, row)
            expand()
        })

        // if the item is selected, keep it selected visually
        if(this._selected && this._selected.obj.id === obj.id) {
            row.classList.add("treeview-item-selected")
            this._selected.el = row
        }

        el.appendChild(row)

        var children = obj[this._opts.prop_children]
        if(children) for(var i in children) {
            this.addChild(el, children[i])
        }

        parentEl.appendChild(el)
    }

    showNewObjectModal() {
        newobject(this).show()
    }

    refresh() {
        utils.removeAllChildren(this._container)

        var children = this._root[this._opts.prop_children]
        if(children) for(var i in children) {
            this.addChild(this._container, children[i])
        }

        this._container.appendChild(dom.hr("margin-left"))

        // virtual objects
        this.addChild(this._container, this._root.$project.$virtualObjects.tags)
        this.addChild(this._container, this._root.$project.$virtualObjects.snippets)
        this.addChild(this._container, this._root.$project.$virtualObjects.characterChart)
    }

    // for mobile
    reveal() {
        this._dom.classList.add("treeview-shown")
        document.body.classList.add("treeview-is-open")
        this._revealed = true
    }
    conceal() {
        this._dom.classList.remove("treeview-shown")
        document.body.classList.remove("treeview-is-open")
        this._revealed = false
    }
    isRevealed() {
        return this._revealed
    }
}

module.exports = TreeView
