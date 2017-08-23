"use strict"

const dom = require('../dom.js')

class AttachmentViewer {
    constructor(project) {
        this.el = dom.modal()
        this._project = project

        this._img = dom.element("img")
        this.el.modal.appendChild(this._img)
    }

    setAttachment(id) {
        var assetInfo = this._project.getAssetInfo(id)
        this.el.setTitle(assetInfo.name)

        this._img.src = ""
        this._project.getAssetUrl(id, url => {
            this._img.src = url
        })
    }
}

module.exports = AttachmentViewer
