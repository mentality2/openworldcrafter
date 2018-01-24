"use strict"

// FOR DEVELOPMENT ONLY -- SHOULD NOT BE USED IN PRODUCTION
// THERE IS A REASON THIS PROJECT USES WEBPACK. IN NON-DEV BUILDS, BUNDLE.JS IS
// THE OUTPUT OF WEBPACK, NOT THIS FILE

if(process.env.NODE_ENV !== "development") throw "Development code used in production environment!"

require("../src/environment/desktop.js")
