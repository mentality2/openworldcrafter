"use strict"

// Creates a placeholder page so the screen doesn't flash while the content is
// loading

document.documentElement.style.backgroundColor = {
    theme_dark: "#333",
    theme_light: "#ccc"
}[localStorage["openworldcrafter.preferences.theme"]]
document.body.style.display = "none"

function removePlaceholder() {
    document.body.style.removeProperty("display")
}

var $placeholder = {
    removePlaceholder
}
