"use strict"

const dom = require('../dom.js')
const common = require('./common.js')
const utils = require('../utils.js')

function createCharacterChartTab(object, ref) {
    var el = dom.div()
    var project = object.$project

    var table = dom.element("table", undefined, "spreadsheet")

    // collect the data we need
    // sort the list of property names by how often those properties are used
    var keyFreq = {}
    for(var id in project.$allObjects) {
        var obj = project.$allObjects[id]
        for(var key in obj.properties) {
            if(keyFreq[key]) keyFreq[key] ++
            else keyFreq[key] = 1
        }
    }
    var properties = Object.keys(keyFreq).sort((a, b) => keyFreq[b] - keyFreq[a])

    // now that we have a list of properties, create the header row
    var headers = dom.tr_headers(properties, "spreadsheet-row", "spreadsheet-cell")
    headers.insertBefore(dom.element("th", "Name", "spreadsheet-cell"), headers.firstChild)
    table.appendChild(headers)

    // now all the objects, in alphabetical order
    var objectOrder = Object.keys(project.$allObjects).sort((a, b) => project.$allObjects[a].name.localeCompare(project.$allObjects[b].name))
    for(var id of objectOrder) {
        let obj = project.$allObjects[id]

        // don't include objects that don't have properties
        if(Object.keys(obj.properties).length) {
            var row = dom.element("tr", undefined, "spreadsheet-row")

            // object name with link
            var name = dom.element("td", undefined, "spreadsheet-cell")
            var link = dom.element("a", obj.name, ["bold", "cursor-pointer", "margin-right"])
            link.addEventListener("click", event => {
                ref.goToPage(obj)
            })
            name.appendChild(link)
            row.appendChild(name)

            for(let prop of properties) {
                // if it's undefined then the dom method will create an empty cell
                // no need to worry about that here
                let cell = dom.element("td", undefined, "spreadsheet-cell")

                let nonEditCell = dom.span(obj.properties[prop], "edit-invisible")
                cell.appendChild(nonEditCell)

                if(project.isEditable()) {
                    let editCell = dom.span(obj.properties[prop], "edit-visible")
                    editCell.contentEditable = true

                    // for styling purposes
                    editCell.addEventListener("focus", ev => cell.classList.add("focused"))
                    editCell.addEventListener("blur", ev => cell.classList.remove("focused"))

                    editCell.addEventListener("keypress", ev => {
                        // this must be in a keypress event instead of keyup in order to fire in time
                        if(ev.keyCode === 13) {
                            ev.preventDefault()
                            editCell.blur()
                        }
                    })
                    editCell.addEventListener("keyup", ev => {
                        obj.addProperty(prop, editCell.innerHTML)
                        nonEditCell.textContent = editCell.textContent
                        obj.markDirty()
                    })
                    cell.appendChild(editCell)
                }

                row.appendChild(cell)
            }
            table.appendChild(row)
        }
    }

    var tableWrapper = dom.element("div", undefined, "spreadsheet-wrapper")
    tableWrapper.appendChild(table)
    el.appendChild(tableWrapper)

    return el
}

function createRow(key, values, object) {
    var row = dom.element("tr")

    var nameEl = dom.element("td")
    nameEl.appendChild(dom.span(key))

    var valueEl = dom.element("td")
    var valueSpan = dom.span(values[key], ["edit-invisible"])
    valueEl.appendChild(valueSpan)
    var editValue = dom.inputText(values[key], "Value", ["edit-visible"])
    editValue.addEventListener("change", ev => {
        values[key] = valueSpan.textContent = editValue.value
        object.markDirty()
    })
    valueEl.appendChild(editValue)

    var deleteEl = dom.element("td")
    var deleteButton = dom.button("delete", undefined, () => {
        delete values[key]
        row.remove()
        object.markDirty()
    }, "edit-visible")
    deleteEl.appendChild(deleteButton)

    row.appendChild(nameEl)
    row.appendChild(valueEl)
    row.appendChild(deleteEl)

    return row
}

function createNameEntry(project) {
    var el = dom.span(undefined, "searchbar-top")

    var textbox = dom.inputText("", "", "searchbar-box")

    function closeResultBox() {
        resultBox.classList.remove("shown")
    }

    function createResultEntry(result) {
        var box = dom.div(result)

        box.tabIndex = 1

        box.addEventListener("click", () => {
            textbox.value = result

            // trigger the code that updates the value input
            textbox.dispatchEvent(new Event("input"))

            closeResultBox()
        })

        return box
    }

    function redoSearch() {
        utils.removeAllChildren(resultBox)

        var empty = true
        for(var prop of project.$propertyList) {
            if(prop.startsWith(textbox.value)) resultBox.appendChild(createResultEntry(prop))
            empty = false
        }
        if(empty) {
            resultBox.classList.remove("shown")
        }
    }

    textbox.addEventListener("keyup", redoSearch)

    el.addEventListener("focusin", () => resultBox.classList.add("shown"))
    el.addEventListener("focusout", event => {
        // don't hide the result box if it is being clicked
        if(!event.relatedTarget || !resultBox.contains(event.relatedTarget)) {
            resultBox.classList.remove("shown")
        }
    })

    el.appendChild(textbox)

    var resultBox = dom.div("", "searchresults")
    el.appendChild(resultBox)

    redoSearch()

    return {el, textbox}
}

function createNewPropertyModal(object, cb) {
    var modal = dom.modal("New Property")

    var property = dom.div("Name: ")
    var nameEntry = createNameEntry(object.$project)
    var propertyIn = nameEntry.textbox
    // fill in 'value' if the property already exists so people don't
    // accidentally overwrite an existing value
    nameEntry.textbox.addEventListener("input", ev => {
        if(object.properties[nameEntry.textbox.value]) valueIn.value = object.properties[nameEntry.textbox.value]
    })
    property.appendChild(nameEntry.el)

    var value = dom.div("Value: ")
    var valueIn = dom.inputText()
    value.appendChild(valueIn)

    function hide() {
        modal.hide()
        propertyIn.value = ""
        valueIn.value = ""
    }

    var actions = dom.div(undefined, "modal-actions")
    var cancel = dom.button(undefined, "Cancel", () => {
        hide()
    })
    var add = dom.button(undefined, "Add", () => {
        object.addProperty(propertyIn.value, valueIn.value)
        cb(propertyIn.value, valueIn.value)
        hide()
    })
    actions.appendChild(cancel)
    actions.appendChild(add)

    modal.modal.appendChild(property)
    modal.modal.appendChild(value)
    modal.modal.appendChild(actions)

    return modal
}

function createCharacterSheetTab(object, ref) {
    var el = dom.div()

    var characterChartLink = dom.element("a", "View Character Chart", ["bold", "cursor-pointer", "margin-right"])
    characterChartLink.addEventListener("click", event => {
        ref.goToPage(object.$project.$virtualObjects.characterChart)
    })
    el.appendChild(characterChartLink)

    var rows = {}

    var table = dom.element("table")
    for(var property in object.properties) {
        var row = createRow(property, object.properties, object)
        rows[property] = row
        table.appendChild(row)
    }

    el.appendChild(table)

    var newModal = createNewPropertyModal(object, (key, val) => {
        var row = createRow(key, object.properties, object)

        if(rows[key]) {
            // if there's an old row, replace it
            table.insertBefore(row, rows[key])
            rows[key].remove()
        } else {
            // otherwise just add it to the end
            table.appendChild(row)
        }

        rows[key] = row
        object.markDirty()
    })
    el.appendChild(newModal.wrapper)

    var add = dom.button("add", "Add Property", () => {
        newModal.show()
    }, "edit-visible")

    var addToolbar = dom.div()
    addToolbar.appendChild(add)
    el.appendChild(addToolbar)

    return el
}

module.exports = { createCharacterSheetTab, createCharacterChartTab }
