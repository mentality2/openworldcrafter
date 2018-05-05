"use strict"

const dom = require('../dom.js')
const utils = require('../utils')

class AttachmentViewer {
    constructor(project) {
        this._project = project

        if(!window.$images) {
            this._modal = dom.modal()
            this._img = dom.element("img", undefined, "fullwidth")
            this._modal.appendChild(this._img)
        }
    }

    showAttachment(attachment) {
        if(window.$images) {
            // use the native plugin to show the image
            this._project.getAsset(attachment, (err, blob) => {
                utils.dataUrlFromBlob(blob, window.$images.showImage)
            })
        } else {
            // show the image in the modal
            var assetInfo = this._project.getAssetInfo(attachment)
            this._modal.setTitle(assetInfo.name)

            this._img.src = ""
            this._project.getAssetUrl(attachment, url => {
                this._img.src = url
            })
            this._modal.show()
        }
    }
}

module.exports = AttachmentViewer
