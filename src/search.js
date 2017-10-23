"use strict"

const dom = require('./dom')
const utils = require('./utils')

function mergeRanges(ranges) {
    if(!ranges.length) return []

    ranges.sort((r1, r2) => r1[0] - r2[0])

    var newRanges = [ranges[0]]
    var i2 = 0
    for(var i = 1; i < ranges.length; i ++) {
        if(newRanges[i2][1] >= ranges[i][0]) {
            newRanges[i2][1] = ranges[i][1]
        } else {
            newRanges.push(ranges[i])
            i2 ++
        }
    }

    return newRanges
}

function stringContainsWords(string, words) {
    string = string.toUpperCase()

    var count = 0
    for(var word of words) {
        if(!word) continue
        word = word.toUpperCase()

        if(string.includes(word)) count ++
    }

    return count
}

function searchTags(list, searchFor, map) {
    for(var tag of searchFor) {
        var tagUuid = map[tag]
        if(list.includes(tagUuid)) return true
    }
    return false
}

function search(project, term, filter) {
    if(!term) return []
    var words = term.split(" ")

    var tags = []
    for(var i in words) {
        if(words[i].startsWith("#")) {
            words[i] = words[i].substring(1)
            tags.push(words[i])
        }
    }

    var results = []

    for(var id in project.$allObjects) {
        var obj = project.$allObjects[id]

        if(filter && !filter(obj)) continue

        if(tags.length) {
            if(!searchTags(obj.tags, tags, project.$tagMap)) continue
        }

        var relevance = 0
        if(obj.name) relevance += stringContainsWords(obj.name, words)
        if(obj.notes) relevance += stringContainsWords(obj.notes, words)

        if(relevance > 0) results.push({
            relevance, obj, snippets: mergeRanges(getWordRanges(obj.notes, words))
        })
    }

    // sort results descending by relevance
    results.sort((obj1, obj2) => obj2.relevance - obj1.relevance)

    return results
}

function getWordRanges(string, words) {
    if(!string) return []
    string = string.toUpperCase()

    var ranges = []
    for(var word of words) {
        if(!word) continue
        word = word.toUpperCase()

        var index = -word.length
        while((index = string.indexOf(word, index + word.length)) > -1) {
            var start = string.lastIndexOf(" ", index - 10)
            ranges.push([start + 1, index + word.length + 20])
        }
    }

    return ranges
}

function createSearchResultBox(result, closeResultBox, cb) {
    var box = dom.div()

    box.appendChild(dom.div(result.obj.name, "bold"))

    box.tabIndex = 1

    box.addEventListener("click", () => {
        closeResultBox()
        cb(result.obj)
    })

    var summary = ""
    for(var snippet of result.snippets) {
        summary += result.obj.notes.substring(snippet[0], snippet[1]) + "\u2026"
    }

    box.appendChild(dom.div(summary))

    return box
}

function createSearchBar(project, cb, filter) {
    var el = dom.span(undefined, "searchbar-top")

    var textbox = dom.inputText("", "Search Project", "searchbar-box")

    function closeResultBox() {
        resultBox.classList.remove("shown")
    }

    function research() {
        utils.removeAllChildren(resultBox)

        var results = search(project, textbox.value, filter)
        if(!results.length) {
            if(textbox.value) resultBox.appendChild(dom.span("No results found."))
            else resultBox.appendChild(dom.span("Start typing to search."))
        }
        for(var result in results) {
            resultBox.appendChild(createSearchResultBox(results[result], closeResultBox, cb))
        }
    }

    textbox.addEventListener("keyup", research)

    el.addEventListener("focusin", () => resultBox.classList.add("shown"))
    el.addEventListener("focusout", event => {
        // don't hide the result box if it is being clicked
        if(!event.relatedTarget || !resultBox.contains(event.relatedTarget)) {
            resultBox.classList.remove("shown")
        }
    })

    el.appendChild(textbox)

    var resultBox = dom.div("Start typing to search.", "searchresults")
    el.appendChild(resultBox)

    return el
}

module.exports = {
    search,
    createSearchBar
}
