"use strict"

const list = require('markdown-it-emoji/lib/data/full.json')
const dom = require('../../dom')

function createEmojiWindow(insertCallback) {
    var el = dom.div(undefined, "emojipicker")

    var buttons = {}

    var name = dom.inputText(undefined, "Search", "fullwidth")
    name.addEventListener("keyup", event => {
        for(var button in buttons) {
            if(button.indexOf(name.value) !== -1) buttons[button].classList.remove("invisible")
            else buttons[button].classList.add("invisible")
        }
    })

    var container = dom.div(undefined, "emojipicker-container")

    for(let emoji in list) {
        var button = dom.span(list[emoji] + "\u200B")
        buttons[`:${emoji}:`] = button

        button.addEventListener("mouseover", event => {
            name.value = `:${emoji}:`
        })
        button.addEventListener("click", event => {
            insertCallback(list[emoji])
            el.classList.remove("shown")
        })

        container.appendChild(button)
    }

    el.appendChild(name)
    el.appendChild(container)

    return el
}

module.exports = createEmojiWindow
