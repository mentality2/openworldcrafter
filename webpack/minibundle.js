"use strict"

// Creates a "mini bundle" containing just a few modules, used for the website
// so simple pages don't have to load the entire application bundle

window.$utils = require("../src/utils.js")
window.$theme = require("../src/theme.js")
window.$dom = require("../src/dom.js")
window.$tabarea = require("../src/tabs/tabarea.js")
