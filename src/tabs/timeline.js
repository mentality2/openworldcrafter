"use strict"

const dom = require('../dom.js')
const common = require('./common.js')
const utils = require('../utils.js')

function createEventBlurb(eventObject, calendar, ref) {
    var el = dom.div()

    var heading = dom.div()

    var link = dom.element("a", eventObject.name, ["bold", "cursor-pointer", "margin-right"])
    link.addEventListener("click", event => {
        ref.goToPage(eventObject)
    })
    heading.appendChild(link)

    if(eventObject.metadata.time) heading.appendChild(dom.span(utils.formatTime(eventObject.metadata.time, calendar)))

    el.appendChild(heading)

    var notes = eventObject.notes
    if(notes) {
        if(notes.length > 200) notes = notes.substring(0, 200) + "\u2026"
        el.appendChild(dom.span(notes))
    }

    return el
}

function createTimelineTab(object, ref) {
    var el = dom.span()

    common.nameEditor(object, el, ref)

    var placeholderHelp = dom.placeholderHelp("{$Click} {$plus} in the project overview to add an event to this timeline.")
    el.appendChild(placeholderHelp)

    var editToolbar = dom.div(undefined, "edit-visible")
    var newEvent = dom.button("add", "New Event", () => {
        ref.showNewObjectModal()
    })

    editToolbar.appendChild(newEvent)
    el.appendChild(editToolbar)

    var sorted = []
    for(var obj in object.subobjects) {
        sorted[obj] = obj
    }
    sorted.sort((id1, id2) =>
        utils.compareDates(object.subobjects[id1].metadata.time, object.subobjects[id2].metadata.time)
    )

    for(var id of sorted) {
        var blurbSuffix = object.subobjects[id].metadata.time ? utils.formatTime(object.subobjects[id].metadata.time, object.metadata.months) : undefined
        var blurb = common.createObjectBlurb(object.subobjects[id], ref, blurbSuffix)
        el.appendChild(blurb)
        placeholderHelp.classList.add("invisible")
    }

    return el
}

function createMonthRow(object, month) {
    let row = dom.element("tr")

    row.appendChild(dom.element("td", parseInt(month) + 1))

    let name = dom.element("td")
    let nameText = dom.span(object.metadata.months[month][0], "edit-invisible")
    name.appendChild(nameText)
    if(object.isEditable()) {
        let editName = dom.inputText(object.metadata.months[month][0], "", "edit-visible")
        editName.onchange = () => {
            nameText.textContent = object.metadata.months[month][0] = editName.value
            object.markDirty()
        }
        name.appendChild(editName)
    }
    row.appendChild(name)

    let days = dom.element("td")
    let daysText = dom.span(object.metadata.months[month][1], "edit-invisible")
    days.appendChild(daysText)
    if(object.isEditable()) {
        let editDays = dom.element("input", null, "edit-visible")
        editDays.value = parseInt(object.metadata.months[month][1])
        editDays.type = "number"
        editDays.onchange = () => {
            daysText.textContent = object.metadata.months[month][1] = editDays.value
            object.markDirty()
        }
        days.appendChild(editDays)
    }
    row.appendChild(days)

    return row
}

function createCalendarTab(object, ref) {
    var el = dom.span()

    if(object.metadata.months) {
        el.appendChild(dom.h2("Months"))

        var table = dom.element("table")
        table.appendChild(dom.tr_headers(["", "Name", "Days"]))
        for(let month in object.metadata.months) {
            table.appendChild(createMonthRow(object, month))
        }

        var toolbar = dom.div("", "edit-visible")
        var add = dom.button("add", "", () => {
            object.metadata.months.push(["New Month", 30])
            table.appendChild(createMonthRow(object, object.metadata.months.length - 1))
            object.markDirty()
        })
        var remove = dom.button("remove", "", () => {
            object.metadata.months.pop()
            table.lastChild.remove()
            object.markDirty()
        })
        toolbar.appendChild(add)
        toolbar.appendChild(remove)

        el.appendChild(table)
        el.appendChild(toolbar)
    }

    return el
}

module.exports = {
    createTimelineTab, createCalendarTab
}
