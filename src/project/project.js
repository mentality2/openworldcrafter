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

        project.$allObjects[this.id] = this
        this.$project = project
        this.$parent = parent

        this.type = serial.type
        this.name = serial.name || "Untitled Object"
        this.civilization = serial.civilization
        this.notes = serial.notes
        this.metadata = serial.metadata || {}
        this.tags = serial.tags || []
        this.relationships = serial.relationships || {}

        this.properties = serial.properties || {}
        for(var property in this.properties) {
            if(!this.$project.$propertyList.includes(property)) this.$project.$propertyList.push(property)
        }

        this.subobjects = []

        if(serial.subobjects) {
            for(var obj of serial.subobjects) {
                if(obj) this.subobjects.push(new ProjectObject(obj, project, this))
            }
        }

        // this.properties = serial.properties || {}
        this.attachments = serial.attachments || []

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

    addTag(tag) {
        var tag = this.$project.getTagByName(tag)
        if(!this.tags.includes(tag.id)) {
            this.markDirty()
            this.tags.push(tag.id)
        }
    }
    removeTag(tagID) {
        var index = this.tags.indexOf(tagID)
        if(index !== -1) {
            this.markDirty()
            this.tags.splice(index, 1)
        }
        this.markDirty()
    }

    addRelationship(role1, role2, character2) {
        var relUuid = uuid()
        var relationship = []

        relationship.push({ role: role1, id: this.id })
        relationship.push({ role: role2, id: character2 })

        var otherChar = this.$project.getObjectById(character2)
        if(!otherChar) return

        this.relationships[relUuid] = relationship
        otherChar.relationships[relUuid] = relationship

        this.markDirty()
    }
    removeRelationship(relID) {
        var rel = this.relationships[relID]
        if(!rel) return

        for(var obj of rel) {
            if(obj.id !== this.id) {
                var otherObject = this.$project.getObjectById(obj.id)
                if(otherObject) delete otherObject.relationships[relID]
            }
        }

        delete this.relationships[relID]

        this.markDirty()
    }

    addProperty(key, val) {
        this.properties[key] = val
        if(!this.$project.$propertyList.includes(key)) this.$project.$propertyList.push(key)
    }
}

class ProjectInfo {
    constructor(serial) {
        this.name = serial.name
        this.description = serial.description
        this.uuid = serial.uuid || uuid()
        this.saveUuid = serial.saveUuid || uuid()
        this.saveVersion = require("../../package.json").version

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
    constructor(serial, store) { try {
        console.log("Loading project from JSON", serial)
        this.info = new ProjectInfo(serial.info)
        this.$store = store

        this.$allObjects = {}
        // list of all properties used on objects
        this.$propertyList = []

        this.projroot = new ProjectObject(serial.projroot, this, null)

        this.assets = serial.assets || {}
        this.options = serial.options

        this.tags = []
        this.$tagMap = {}
        for(var tagObj of serial.tags || []) {
            this.tags.push(new ProjectObject(tagObj, this, null))
            this.$tagMap[tagObj.name] = tagObj.id
        }

        this.$_dirty = false

        this.$saveListener = () => {}

        console.log("properties", this.$propertyList);
    } catch(e) { console.log(e) } }

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

    getAllTags() {
        return this.tags
    }

    getTagByName(name) {
        if(this.$tagMap[name]) return this.$allObjects[this.$tagMap[name]]

        this.markDirty()

        var newTag = new ProjectObject({
            type: "tag", name
        }, this, null)
        this.tags.push(newTag)
        this.$tagMap[name] = newTag.id
        return newTag
    }

    getObjectsByTag(tagId) {
        var objList = []
        for(var id in this.$allObjects) {
            var obj = this.$allObjects[id]
            if(obj.tags.includes(tagId)) objList.push(obj)
        }
        return objList
    }
}

module.exports = {
    Project,
    ProjectObject,
    ProjectInfo,
    Author
}
