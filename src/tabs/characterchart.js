"use strict"

const dom = require('../dom.js')
const utils = require('../utils.js')

function createColorDropdown(ref) {
    var el = dom.div(undefined, "color-dropdown")

    var count = 0
    for(let color of utils.colors) {
        var patch = dom.span(undefined, ["colorpatch", color, "cursor-pointer"])

        patch.addEventListener("click", ev => {
            ref.setColor(color)
            el.classList.add("invisible")
        })
        patch.addEventListener("mouseenter", ev => {
            ref.el.classList.remove(...utils.colors)
            ref.el.classList.add(color)
        })
        patch.addEventListener("mouseleave", ev => {
            ref.el.classList.remove(...utils.colors)
            ref.el.classList.add(ref.originalColor)
        })

        el.appendChild(patch)
        if(++count % 4 == 0) {
            el.appendChild(dom.br())
        }
    }

    return el
}

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

    if(properties.length === 0) {
        // luckily, this won't change while the page is loaded

        var placeholderHelp = dom.placeholderHelp("This page shows all your Character Sheets in one table. To start, go to a character's Character Sheet and add a property.", "character_chart")
        el.appendChild(placeholderHelp)

        return el
    }

    // now that we have a list of properties, create the header row
    var headers = dom.tr_headers(properties, "spreadsheet-row", "spreadsheet-cell")
    headers.insertBefore(dom.element("th", "Name", "spreadsheet-cell"), headers.firstChild)
    table.appendChild(headers)

    var cellMap = {}
    function updateColumnColors(prop) {
        for(var id in cellMap) {
            var newColor = project.getPropertyColor(prop, project.$allObjects[id].properties[prop])

            // hooray for polyfills! we can use spread arguments
            cellMap[id][prop].classList.remove(...utils.colors)
            cellMap[id][prop].classList.add(newColor)
        }
    }

    // now all the objects, in alphabetical order
    var objectOrder = Object.keys(project.$allObjects).sort((a, b) => project.$allObjects[a].name.localeCompare(project.$allObjects[b].name))
    for(let id of objectOrder) {
        let obj = project.$allObjects[id]

        // don't include objects that don't have properties
        if(Object.keys(obj.properties).length) {
            var row = dom.element("tr", undefined, "spreadsheet-row")
            cellMap[id] = {}

            // object name with link
            var name = dom.element("td", undefined, "spreadsheet-cell")
            var link = dom.element("a", obj.name, ["bold", "cursor-pointer", "margin-right"])
            link.addEventListener("click", event => {
                ref.goToPage(obj)
            })
            name.appendChild(link)
            row.appendChild(name)

            var colorchooserRef = {}
            var colorchooser = createColorDropdown(colorchooserRef)

            for(let prop of properties) {
                // if it's undefined then the dom method will create an empty cell
                // no need to worry about that here
                let cell = dom.element("td", undefined, "spreadsheet-cell")
                cell.classList.add(obj.$project.getPropertyColor(prop, obj.properties[prop]))

                cellMap[id][prop] = cell

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
                        updateColumnColors(prop)
                        obj.markDirty()
                    })

                    cell.appendChild(editCell)

                    var color = dom.button("color", undefined, () => {}, ["color-button", "nobutton"])
                    color.addEventListener("mouseenter", () => {
                        colorchooserRef.setColor = newColor => {
                            project.setPropertyColor(prop, obj.properties[prop], newColor)
                            updateColumnColors(prop)
                            colorchooserRef.originalColor = newColor
                            obj.markDirty()
                        }
                        colorchooserRef.originalColor = object.$project.getPropertyColor(prop, obj.properties[prop])
                        colorchooserRef.el = cell

                        colorchooser.classList.remove("invisible")
                        cell.appendChild(colorchooser)
                    })
                    cell.addEventListener("mouseleave", () => {
                        colorchooser.remove()
                    })
                    cell.appendChild(color)
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

module.exports = createCharacterChartTab
