"use strict"

function elipsize(str, len) {
    if(str.length > len) return str.substr(0, len - 1) + "\u2026"
    else return str
}

class ProjectList {
    constructor(data, save) {
        this.projects = data
        this._save = save
    }

    addProjectEntry(name, location, desc, cb) {
        this.addProject({ name, location, desc }, cb)
    }

    addProject(file, cb) {
        file.desc = elipsize(file.desc || "", 200)
        file.timestamp = new Date().getTime()

        // avoid duplicate entries by removing the previous one, if any
        for(var i = 0; i < this.projects.length;) {
            if(this.projects[i].location === file.location) {
                this.projects.splice(i, 1)
            } else i ++
        }

        this.projects.unshift(file)

        this.save(cb)
    }

    removeProject(location, cb) {
        for(var i = 0; i < this.projects.length;) {
            if(this.projects[i].location === location) {
                this.projects.splice(i, 1)
            } else i ++
        }

        this.save(cb)
    }

    save(cb) {
        this._save(this.projects, cb || (() => {}))
    }
}

module.exports.ProjectList = ProjectList
