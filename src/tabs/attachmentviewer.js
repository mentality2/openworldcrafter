"use strict"

const dom = require('../dom.js')

class AttachmentViewer {
    constructor(project) {
        this._project = project

        if(!window.$images) {
            this._modal = dom.modal()
            this._img = dom.element("img")
            this._modal.appendChild(this._img)
        }
    }

    showAttachment(attachment) {
        if(window.$images) {
            // use the native plugin to show the image
            this._project.getAssetUrl(attachment, window.$images.showImage)
        } else {
            // show the image in the modal
            var assetInfo = this._project.getAssetInfo(id)
            this._modal.setTitle(assetInfo.name)

            this._img.src = ""
            this._project.getAssetUrl(id, url => {
                this._img.src = url
            })
            this._modal.show()
        }
    }
}

module.exports = AttachmentViewer
