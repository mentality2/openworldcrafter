"use strict"

const dom = require('../dom.js')
const utils = require('../utils.js')

function createNewObjectModal(treeview) {
    var newObject = dom.modal("New Item")

    var typeRow = dom.div()
    typeRow.appendChild(dom.span("Type: "))
    var newObjectType = dom.element("select")
    typeRow.appendChild(newObjectType)

    var nameRow = dom.div()
    nameRow.appendChild(dom.span("Name: "))
    var newObjectName = dom.inputText("Untitled Item", "Item Name")
    nameRow.appendChild(newObjectName)

    var addActions = dom.div("", "modal-actions")
    var cancelAddAction = dom.span("Cancel", "button")
    cancelAddAction.addEventListener("click", event => {
        newObject.wrapper.classList.remove("modal-visible")
        event.stopPropagation()
    })
    var addAction = dom.span("Add", "button")
    addAction.addEventListener("click", event => {
        var parent = treeview.getSelected() ? treeview.getSelected() : treeview.getRootObj()

        var obj = parent.addObject(newObjectType.value, newObjectName.value)

        newObject.wrapper.classList.remove("modal-visible")

        treeview.refresh()
        treeview.setSelected(obj)

        obj.save(true)

        event.stopPropagation()
    })
    addActions.appendChild(cancelAddAction)
    addActions.appendChild(addAction)

    newObject.modal.appendChild(typeRow)
    newObject.modal.appendChild(nameRow)
    newObject.modal.appendChild(addActions)

    newObject.show = function() {
        var parentType = treeview.getSelected() ? treeview.getSelected().type : "folder"
        if(utils.acceptableSubobjects[parentType]) {
            newObjectName.value = "Untitled Item"

            utils.removeAllChildren(newObjectType)
            for(var type of utils.acceptableSubobjects[parentType]) {
                let option = dom.element("option", type)
                option.name = type
                newObjectType.appendChild(option)
            }

            this.wrapper.classList.add("modal-visible")
        }
    }

    return newObject
}

module.exports = createNewObjectModal
