"use strict"

const TreeView = require('./treeview.js')
const dom = require('../dom.js')

function createProjectFolderView(project, ref) {
    var el = dom.div()
    return {
        el, obj: new TreeView(el, project.projroot, ref)
    }
}

module.exports = {
    TreeView, createProjectFolderView
}
