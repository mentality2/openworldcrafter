"use strict"

const dom = require('../dom.js')
const utils = require('../utils.js')

function createNewObjectModal(treeview) {
    var parent = treeview.getSelected() || treeview.getRootObj()

    var newObject = dom.modal("New Item", true)

    var typeRow = dom.div("Type: ")
    var newObjectType = dom.element("select")
    typeRow.appendChild(newObjectType)

    if(utils.acceptableSubobjects[parent.type]) {
        for(var type of utils.acceptableSubobjects[parent.type]) {
            let option = dom.element("option", type)
            option.name = type
            newObjectType.appendChild(option)
        }
    }

    var nameRow = dom.div("Name: ")
    var newObjectName = dom.inputText("Untitled Item", "Item Name")
    nameRow.appendChild(newObjectName)

    newObject.modal.appendChild(typeRow)
    newObject.modal.appendChild(nameRow)

    newObject.okCancel(event => {
        event.stopPropagation()

        var obj = parent.addObject(newObjectType.value, newObjectName.value)
        treeview.refresh()
        treeview.setSelected(obj)
        obj.save(true)

        newObject.hide()
    }, "Add")

    return newObject
}

module.exports = createNewObjectModal
