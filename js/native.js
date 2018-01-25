$native = {}

$native.fs = require("fs")
$native.path = require("path")
$native.electron = require("electron")
$native.jszip = require("jszip")
$native.uuid = require("uuid/v4")
$native.https = require("https")

// run the code that loads the page
var script = document.createElement("script")
script.src = "../js/bundle.js"
script.addEventListener("load", $go)
document.body.appendChild(script)
