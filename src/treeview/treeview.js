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

        this._dom.addEventListener("click", event => {
            this.setSelected()
        })

        this._container = dom.div(null, "treeview-container")
        this._dom.appendChild(this._container)

        if(rootobj.$project.isEditable()) {
            this._toolbar = dom.div("", "toolbar")
            this._dom.appendChild(this._toolbar)

            this._newObjectModal = newobject(this)

            this._addButton = dom.button("add", null, event => {
                this._newObjectModal.show()
                event.stopPropagation()
            })

            this._dom.appendChild(this._newObjectModal.wrapper)

            var remove = dom.button("remove", null, event => {
                if(this._selected) {
                    var deleteObject = this._selected.obj

                    confirmDeleteText.textContent = `Are you sure you want to delete ${ deleteObject.name }`
                    if(Object.keys(deleteObject.subobjects).length) confirmDeleteText.textContent += " and anything in it?"
                    else confirmDeleteText.textContent += "?"

                    confirmDelete.wrapper.classList.add("modal-visible")
                }
                event.stopPropagation()
            })

            this._toolbar.appendChild(this._addButton)
            this._toolbar.appendChild(remove)

            var confirmDelete = dom.modal("Confirm Delete")
            var confirmDeleteText = dom.div(`Are you sure you want to delete this item and anything in it?`)

            var actions = dom.div("", "modal-actions")
            var cancelAction = dom.span("Cancel", "button")
            cancelAction.addEventListener("click", event => {
                confirmDelete.show()
                event.stopPropagation()
            })
            var deleteAction = dom.span("Delete", "button")
            deleteAction.addEventListener("click", event => {
                this._selected.obj.$parent.removeChild(this._selected.obj.id)
                confirmDelete.hide()

                this.refresh()
                this.setSelected()

                rootobj.save(true)

                event.stopPropagation()
            })
            actions.appendChild(cancelAction)
            actions.appendChild(deleteAction)

            confirmDelete.modal.appendChild(confirmDeleteText)
            confirmDelete.modal.appendChild(actions)

            this._dom.appendChild(confirmDelete.wrapper)
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
    }

    addChild(parentEl, obj) {
        var el = dom.div(null, ["treeview-item", "treeview-item-collapsed"])

        var arrow = dom.span(rightArrow)

        if(!Object.keys(obj.subobjects).length) {
            arrow.classList.add("hidden")
        }

        arrow.addEventListener("click", event => {
            if(arrow.textContent === downArrow) {
                // collapse content
                el.classList.add("treeview-item-collapsed")
                arrow.textContent = rightArrow
                delete this._expandedNodes[obj.id]
            } else {
                // expand content
                el.classList.remove("treeview-item-collapsed")
                arrow.textContent = downArrow
                this._expandedNodes[obj.id] = true
            }
            event.stopPropagation()
        })
        el.appendChild(arrow)

        // if the object was already expanded and it still has subobjects, keep
        // it expanded
        if(this._expandedNodes[obj.id] && Object.keys(obj.subobjects).length) {
            el.classList.remove("treeview-item-collapsed")
            arrow.textContent = downArrow
        }

        var row = dom.span(obj[this._opts.prop_name])
        this._rowArray[obj.id] = row
        row.addEventListener("click", event => {
            this.setSelected(obj, row)
            event.stopPropagation()
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
        this._newObjectModal.show()
    }

    refresh() {
        utils.removeAllChildren(this._container)

        var children = this._root[this._opts.prop_children]
        if(children) for(var i in children) {
            this.addChild(this._container, children[i])
        }
    }
}

module.exports = TreeView
