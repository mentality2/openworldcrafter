"use strict"

// Prevent changing URL by drag and drop
window.addEventListener("dragover", e => {
    if(e) e.preventDefault()
}, false)
window.addEventListener("drop", e => {
    if(e) e.preventDefault()
}, false)
