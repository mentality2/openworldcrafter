"use strict"

const dom = require('../dom.js')
const common = require('./common.js')
const search = require('../search')
const utils = require('../utils.js')

const relationships = [
    ["Brothers", "Brother"],
    ["Sisters", "Sister"],
    ["Brother/Sister", "Brother", "Sister"],
    ["Parent/Child", "Parent", "Child"],

    ["Friends", "Friend"],
    ["Enemies", "Enemy"],
    ["Acquaintances", "Acquaintance"],
    ["Boss/Employee", "Boss", "Employee"]
]

function createModal(obj, cb) {
    var modal = dom.modal("New Relationship")
    var linkSearch = search.createSearchBar(obj.$project, result => {
        char2uuid = result.id
        char2Name.textContent = result.name
        add.classList.remove("button-disabled")
    }, object => (object.type === "character" && object.id !== obj.id))

    var char2uuid

    var selectDiv = dom.div("Relationship: ")
    var select = dom.element("select")
    for(var rel of relationships) {
        let option = dom.element("option", rel[0])
        select.appendChild(option)
    }
    var swap = dom.button(undefined, "Swap Roles", () => {
        if(char1RoleEdit) {
            var tmp = char1RoleEdit.value
            char1RoleEdit.value = char2RoleEdit.value
            char2RoleEdit.value = tmp
        } else {
            var tmp = char1Role.textContent
            char1Role.textContent = char2Role.textContent
            char2Role.textContent = tmp
        }
    })
    select.appendChild(dom.element("option", "Other"))
    select.addEventListener("change", updateSelect)
    selectDiv.appendChild(select)
    selectDiv.appendChild(swap)

    var char1 = dom.div()
    var char1Role = dom.span(undefined, ["margin-right", "bold", "relationships-modal-label"])
    char1.appendChild(char1Role)
    var char1Name = dom.span(obj.name)
    char1.appendChild(char1Name)

    var char2 = dom.div()
    var char2Role = dom.span(undefined, ["margin-right", "bold", "relationships-modal-label"])
    char2.appendChild(char2Role)
    var char2Name = dom.span()
    char2Name.appendChild(linkSearch)
    char2.appendChild(char2Name)

    modal.modal.appendChild(selectDiv)
    modal.modal.appendChild(char1)
    modal.modal.appendChild(char2)

    var char1RoleEdit
    var char2RoleEdit

    function updateSelect() {
        var rel = relationships[select.selectedIndex]
        if(rel) {
            char1Role.textContent = rel[1]
            char2Role.textContent = rel[2] || rel[1]
            char1RoleEdit = undefined
            char2RoleEdit = undefined
        } else {
            utils.removeAllChildren(char1Role)
            utils.removeAllChildren(char2Role)
            char1Role.appendChild(char1RoleEdit = dom.inputText())
            char2Role.appendChild(char2RoleEdit = dom.inputText())
        }
    }
    updateSelect()

    var modalActions = dom.div(undefined, "modal-actions")
    var cancel = dom.button(undefined, "Cancel", () => {
        modal.wrapper.remove()
    })
    var add = dom.button(undefined, "Add", () => {
        if(!char2uuid) return

        var r1, c1, r2, c2
        if(char1RoleEdit) r1 = char1RoleEdit.value
        else r1 = char1Role.textContent
        if(char2RoleEdit) r2 = char2RoleEdit.value
        else r2 = char2Role.textContent

        obj.addRelationship(r1, r2, char2uuid)
        cb()

        modal.wrapper.remove()
    }, "button-disabled")
    modalActions.appendChild(cancel)
    modalActions.appendChild(add)
    modal.modal.appendChild(modalActions)

    return modal
}

function findOtherObject(rel, id) {
    for(var obj of rel) if(obj.id !== id) return obj
}

function createRelationshipsTab(object, ref) {
    var el = dom.div()

    var placeholderHelp = dom.placeholderHelp(`{$Click} {$edit} to edit ${ object.name }'s relationships.`, "relationships")
    el.appendChild(placeholderHelp)

    if(object.isEditable()) {
        var editDiv = dom.div(undefined, "edit-visible")
        editDiv.appendChild(dom.button("add", "Add Relationship", () => {
            var modal = createModal(object, remakeBlurbs)
            el.appendChild(modal.wrapper)
            modal.show()
        }, "margin-top-3px"))
        el.appendChild(editDiv)
    }

    var relationshipDiv = dom.div()
    el.appendChild(relationshipDiv)

    function remakeBlurbs() {
        utils.removeAllChildren(relationshipDiv)
        placeholderHelp.classList.remove("invisible")

        var previous = {}

        for(let relID in object.relationships) {
            placeholderHelp.classList.add("invisible")

            var rel = object.relationships[relID]
            var partner = findOtherObject(rel, object.id)
            if(!partner) continue
            var otherObject = object.$project.getObjectById(partner.id)
            if(!otherObject) continue

            if(previous[partner.id]) {
                // don't display a character twice in the list, instead just add
                // this relationship to the previous blurb

                previous[partner.id].textContent += ", " + partner.role
                return
            }

            var del = dom.button("delete", undefined, () => {
                object.removeRelationship(relID)
                blurb.remove()
            }, ["edit-visible", "inline", "margin-left"])
            var blurbSuffix = dom.span()
            var roleList = dom.span(partner.role, "margin-right")
            blurbSuffix.appendChild(roleList)
            blurbSuffix.appendChild(del)
            let blurb = common.createObjectBlurb(otherObject, ref, blurbSuffix)
            relationshipDiv.appendChild(blurb)

            previous[partner.id] = roleList
        }
    }
    remakeBlurbs()

    return el
}

module.exports = createRelationshipsTab
