"use strict"

const dom = require('../dom.js')

function createLoginBox() {
    var box = dom.div()

    box.appendChild(dom.h2("Log In"))
    box.appendChild(dom.span("Login to OpenWorldFactory to save and share your projects online"))
    box.appendChild(dom.br())

    var username = dom.inputText("", "Username")
    var password = dom.element("input")
    password.placeholder = "Password"
    password.type = "password"

    box.appendChild(username)
    box.appendChild(dom.br())
    box.appendChild(password)

    var login = dom.button("", "Login", () => {
        // TODO: Log the user in
    })
    box.appendChild(dom.br())
    box.appendChild(dom.br())
    box.appendChild(login)

    // box.appendChild(dom.hr())
    // box.appendChild(dom.h2("Sign Up"))

    return box
}

module.exports = {
    createLoginBox
}
