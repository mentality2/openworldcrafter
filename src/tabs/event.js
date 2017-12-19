"use strict"

const dom = require('../dom.js')
const common = require('./common.js')
const utils = require('../utils.js')

function createEventTab(object, ref) {
    var el = dom.span()

    common.nameEditor(object, el, ref)

    var date = dom.div(null, "edit-invisible")
    el.appendChild(date)

    function updateDateText() {
        date.textContent = utils.formatTime(object.metadata.time, object.$parent.metadata.months)

        if(object.isEditable()) {
            timeSelect.value = utils.getDateField(object.metadata.time, "timeofday")

            if(utils.getDateField(object.metadata.time, "timeofday") === "exactTime") {
                hourMinEdit.classList.remove("hidden")
            } else {
                hourMinEdit.classList.add("hidden")
            }

            day.max = object.$parent.metadata.months[utils.getDateField(object.metadata.time, "month") - 1][1]
        }
    }

    if(object.isEditable()) {
        var dateEditor = dom.div("Date: ", "edit-visible")

        var day = dom.input("number", utils.getDateField(object.metadata.time, "day"), () => {
            object.metadata.time = utils.setDateField(object.metadata.time, "day", day.value)
            object.markDirty()
            updateDateText()
        })
        day.min = 1

        var monthEdit = dom.element("select")
        for(var month in object.$parent.metadata.months) {
            var opt = dom.element("option", object.$parent.metadata.months[month][0])
            opt.value = parseInt(month) + 1
            monthEdit.appendChild(opt)
        }
        monthEdit.value = utils.getDateField(object.metadata.time, "month")
        monthEdit.addEventListener("change", () => {
            object.metadata.time = utils.setDateField(object.metadata.time, "month", monthEdit.value)
            object.markDirty()
            updateDateText()
        })
        var year = dom.input("number", utils.getDateField(object.metadata.time, "year"), () => {
            object.metadata.time = utils.setDateField(object.metadata.time, "year", year.value)
            object.markDirty()
            updateDateText()
        }, "wide")

        dateEditor.appendChild(day)
        dateEditor.appendChild(monthEdit)
        dateEditor.appendChild(year)

        var timeEditor = dom.div("Time: ", "edit-visible")

        var timeSelect = dom.element("select")
        var optGroup1 = dom.element("optgroup")

        var allDay = dom.element("option", "All Day")
        allDay.value = "allDay"
        optGroup1.appendChild(allDay)

        var exactTime = dom.element("option", "Exact Time")
        exactTime.value = "exactTime"
        optGroup1.appendChild(exactTime)

        var optGroup2 = dom.element("optgroup")

        for(var time in utils.timesOfDay) {
            var opt = dom.element("option", utils.timesOfDay[time])
            opt.value = time
            optGroup2.appendChild(opt)
        }

        timeSelect.appendChild(optGroup1)
        timeSelect.appendChild(optGroup2)

        timeSelect.addEventListener("change", () => {
            if(timeSelect.value === "exactTime") {
                object.metadata.time = utils.setDateField(object.metadata.time, "hour", 0)
                object.metadata.time = utils.setDateField(object.metadata.time, "minute", 0)
            } else if(timeSelect.value === "allDay") {
                object.metadata.time = utils.setDateField(object.metadata.time, "allday")
            } else {
                object.metadata.time = utils.setDateField(object.metadata.time, "timeofday", timeSelect.value)
            }

            object.markDirty()
            updateDateText()
        })

        var hourMinEdit = dom.span()

        var hour = dom.input("number", utils.getDateField(object.metadata.time, "hour"), () => {
            object.metadata.time = utils.setDateField(object.metadata.time, "hour", parseInt(hour.value))
            object.markDirty()
            updateDateText()
        }, "no-margin-right")
        hour.min = 0
        hour.max = 23
        var min = dom.input("number", utils.getDateField(object.metadata.time, "minute"), () => {
            object.metadata.time = utils.setDateField(object.metadata.time, "minute", parseInt(min.value))
            object.markDirty()
            updateDateText()
        })
        min.min = 0
        min.max = 59

        hourMinEdit.appendChild(hour)
        hourMinEdit.appendChild(dom.span(":"))
        hourMinEdit.appendChild(min)

        timeEditor.appendChild(timeSelect)
        timeEditor.appendChild(hourMinEdit)

        el.appendChild(dateEditor)
        el.appendChild(timeEditor)
    }

    updateDateText()

    common.notes(object, el, ref)

    return el
}

module.exports = createEventTab
