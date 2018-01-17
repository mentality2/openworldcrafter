"use strict"

var allShortcuts = []

function createShortcut(key, cb) {
    window.addEventListener("keydown", ev => {
        if(ev.key === key && ev.ctrlKey) {
            cb()
        }
    })

}
module.exports.createShortcut = createShortcut

function clearShortcuts() {
    for(var sc of allShortcuts) {
        window.removeEventListener(sc)
    }
    allShortcuts = []
}
module.exports.clearShortcuts = clearShortcuts
