"use strict"

// https://stackoverflow.com/questions/31280096/detect-when-soft-keyboard-is-in-use-abd-run-a-js-function#31280342

function getWindowDimensions() {
    // https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
    return {
    height: window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight,
    width: window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth
    }
}

function emitEvent(name) {
    window.dispatchEvent(new Event(name))
}

module.exports = function() {
    var dimLast = getWindowDimensions()

    window.addEventListener("resize", () => {
        var dim = getWindowDimensions()

        var wasKeyboardOpen = window.isMobileKeyboardOpen
                                window.isMobileKeyboardOpen = (dim.width === dimLast.width)
                                && (dim.height < dimLast.height)

        if(isMobileKeyboardOpen && !wasKeyboardOpen) {
            emitEvent("keyboardopened")
        } else if(!isMobileKeyboardOpen && wasKeyboardOpen) {
            emitEvent("keyboardclosed")
        }

        dimLast = dim
    })
}
