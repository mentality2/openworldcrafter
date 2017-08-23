"use strict"

const utils = require('../utils.js')
const uuid = require('uuid/v4')

class Author {
    constructor(author) {
        if(typeof author === "string") {
            this.name = author
        } else {
            this.name = author.name
            this.website = author.website
            this.email = author.email
        }
    }
}

class ProjectObject {
    constructor(serial, project, parent) {
        this.id = serial.id || project.newId()
        this.type = serial.type
        this.name = serial.name || "Untitled Object"
        this.civilization = serial.civilization
        this.notes = serial.notes
        this.metadata = serial.metadata || {}

        this.subobjects = []

        if(serial.subobjects) {
            for(var obj of serial.subobjects) {
                if(obj) this.subobjects.push(new ProjectObject(obj, project, this))
            }
        }

        // this.properties = serial.properties || {}
        this.attachments = serial.attachments || []

        project.$allObjects[this.id] = this
        this.$project = project
        this.$parent = parent

        if(this.type === "timeline" && !this.metadata.months) {
            this.metadata.months = utils.defaultCalendar.months
        }
        if(this.type === "event" && !this.metadata.time) {
            this.metadata.time = "0 1 1 1 0"
        }
    }

    addObject(type, name) {
        this.markDirty()

        var obj = new ProjectObject({
            type, name
        }, this.$project, this)
        this.subobjects.push(obj)

        return obj
    }

    removeChild(id) {
        for(var object in this.subobjects) {
            if(this.subobjects[object].id === id) {
                this.subobjects.splice(object, 1)
            }
        }
        delete this.$project.$allObjects[id]
        this.markDirty()
    }

    isEditable() {
        return this.$project.isEditable()
    }
    markDirty() {
        this.$project.markDirty()
    }
    save(force) {
        this.$project.save(force)
    }
}

class ProjectInfo {
    constructor(serial) {
        this.name = serial.name
        this.description = serial.description
        this.uuid = serial.uuid || uuid()
        this.saveUuid = serial.saveUuid || uuid()

        this.authors = []
        if(serial.authors) {
            for(var author of serial.authors) {
                this.authors.push(new Author(author))
            }
        }
    }

    assignSaveUuid() {
        this.saveUuid = uuid()
    }
}

class Project {
    constructor(serial, store) {
        console.log("Loading project from JSON", serial)
        this.info = new ProjectInfo(serial.info)
        this.$store = store

        this.$allObjects = {}

        this.projroot = new ProjectObject(serial.projroot, this, null)

        this.assets = serial.assets || {}
        this.options = serial.options

        this.$_dirty = false

        this.$saveListener = () => {}
    }

    getObjectById(id) {
        return this.$allObjects[id]
    }

    newId() {
        return uuid()
    }

    serializeJSON() {
        return JSON.stringify(this, (key, value) => key.startsWith("$") ? undefined : value)
    }

    serialize() {
        return JSON.parse(this.serializeJSON())
    }

    addAsset(buffer, cb) {
        this.$store.addAsset(buffer, id => {
            this.assets[id] = {
                diskid: id
            }

            this.markDirty()
            cb(id)
        })
    }

    removeAsset(id, cb) {
        this.$store.deleteAsset(id, () => {
            delete this.assets[id]

            this.markDirty()
            cb()
        })
    }

    getAssetUrl(id, cb) {
        this.$store.getAssetUrl(this.assets[id].diskid, cb)
    }

    getAssetInfo(id) {
        return this.assets[id]
    }

    save(force) {
        if(force || this.$_dirty) {
            this.info.assignSaveUuid()
            this.$store.saveProjectFile(this.serializeJSON(), () => {
                this.$_dirty = false
                document.title = this.info.name + " - OpenWorldFactory"
                this.$saveListener()
            }, (errmsg, button, buttonAction) => this.$saveListener(errmsg, button, buttonAction))
        }
        else console.log("Skipping save as no changes have been made")
    }

    isEditable() {
        return this.$store.editable
    }

    markDirty() {
        this.$_dirty = true
        document.title = "*" + this.info.name + " - OpenWorldFactory"
    }
    isDirty() {
        return this.$_dirty
    }
}

module.exports = {
    Project,
    ProjectObject,
    ProjectInfo,
    Author
}
