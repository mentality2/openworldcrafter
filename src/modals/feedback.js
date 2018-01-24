"use strict"

const dom = require('../dom')
const buildinfo = require('../buildinfo')

var sendDebugInfoID = 0

function showThanksModal(email) {
    var modal = dom.modal("Thanks!")

    if(email) {
        modal.appendChild(dom.div(`Thanks for your feedback! I'll review it and get back to you at ${ email } when I get a chance.`))
    } else {
        modal.appendChild(dom.div("Thanks for your feedback! I'll review it when I get a chance and see what I can do."))
    }

    modal.show()
}

function showOopsModal(type, body) {
    var modal = dom.modal("Oops")

    var contents = dom.div()
    contents.appendChild(dom.span("Something went wrong, and your feedback couldn't be submitted. "))
    var url = `mailto:openworldcrafter@gmail.com?subject=${ encodeURIComponent(type) }%20for%20openworldcrafter&body=${ encodeURIComponent(body) }`

    var emailLink = dom.element("a", "Click here to email me directly. ")
    emailLink.addEventListener("click", () => $owf.showWebpage(url))
    contents.appendChild(emailLink)

    contents.appendChild(dom.span("If that doesn't work, my email address is openworldcrafter@gmail.com."))

    modal.appendChild(contents)
    modal.show()
}

function createFeedbackModal() {
    var modal = dom.modal("Feedback", true)

    var select = dom.element("select")
    var options = {
        general_feedback: "General Feedback",
        bug_report: "Bug Report",
        feature_request: "Feature Request",
        security_vulnerability: "Security Vulnerability"
    }
    for(var opt in options) {
        var option = dom.element("option", options[opt])
        option.value = opt
        select.appendChild(option)
    }
    select.addEventListener("change", updateModal)

    function updateModal() {
        if(select.value === "general_feedback") {
            textbox.placeholder = "Leave your feedback here"
        }

        if(select.value === "bug_report") {
            textbox.placeholder = `What problems are you experiencing? Please be specific (i.e. "I see a blank page when I load a project" rather than "It doesn't work.") Also include steps to reproduce the bug, if you can. The more information, the faster I can fix it.`

            debugInfoSection.classList.remove("invisible")
            sendDebugInfo.checked = true
        } else {
            debugInfoSection.classList.add("invisible")
            sendDebugInfo.checked = false
        }

        if(select.value === "feature_request") {
            textbox.placeholder = "What feature would you like to see in openworldcrafter? Please be specific and explain how it would be useful to you."
        }

        if(select.value === "security_vulnerability") {
            securitySection.classList.remove("invisible")
            textbox.classList.add("invisible")
            // email.classList.add("invisible")
            modalActions.classList.add("invisible")
        } else {
            securitySection.classList.add("invisible")
            textbox.classList.remove("invisible")
            // email.classList.remove("invisible")
            modalActions.classList.remove("invisible")
        }
    }
    var selectDiv = dom.div()
    selectDiv.appendChild(select)

    var textbox = dom.element("textarea")

    // var email = dom.element("input", undefined, "no-margin-right")
    // email.type = "email"
    // email.placeholder = "Email address for followup (optional)"

    var sendDebugInfo = dom.element("input")
    sendDebugInfo.type = "checkbox"
    sendDebugInfo.id = `send-debug-info-checkbox-${ ++ sendDebugInfoID }`
    var sendDebugInfoLabel = dom.element("label", "Send the following debug information:")
    sendDebugInfoLabel.htmlFor = `send-debug-info-checkbox-${ sendDebugInfoID }`
    var debugInfo = dom.element("code", buildinfo.getBuildString())

    var debugInfoSection = dom.div(undefined, "invisible")
    debugInfoSection.appendChild(sendDebugInfo)
    debugInfoSection.appendChild(sendDebugInfoLabel)
    debugInfoSection.appendChild(debugInfo)

    var securitySection = dom.div(undefined, ["invisible", "no-margin-bottom"])

    var emailLink = dom.element("a", "openworldcrafter@gmail.com")
    emailLink.addEventListener("click", () => $owf.showWebpage("mailto:openworldcrafter@gmail.com"))

    var keyLink = dom.element("a", "https://www.openworldcrafter.com/openworldcrafter.asc")
    keyLink.addEventListener("click", () => $owf.showWebpage("https://www.openworldcrafter.com/openworldcrafter.asc"))

    securitySection.appendChild(dom.span("To report a security vulnerability, please email me directly at "))
    securitySection.appendChild(emailLink)
    securitySection.appendChild(dom.span(". My public key can be found at "))
    securitySection.appendChild(keyLink)
    securitySection.appendChild(dom.span(". If possible, please use it to encrypt your message. I will try to respond ASAP."))

    modal.appendChild(selectDiv)
    modal.appendChild(textbox)
    // modal.appendChild(email)
    modal.appendChild(debugInfoSection)
    modal.appendChild(securitySection)

    var modalActions = modal.okCancel(send => {
        var request = new XMLHttpRequest()

        request.onload = () => {
            modal.hide()

            if(request.status >= 200 && request.status < 300) {
                showThanksModal()
            } else {
                oopsModal()
            }
        }
        request.onerror = err => {
            modal.hide()
            oopsModal()
        }

        function oopsModal() {
            showOopsModal(options[select.value], textbox.value + (sendDebugInfo.checked ? `\n\nDebug info: ${ buildinfo.getBuildString() }` : ""))
        }

        var formData = {
            type: select.value,
            text: textbox.value
        }
        if(sendDebugInfo.checked) {
            formData.debug = buildinfo.getBuildString()
        }

        request.open("POST", "https://www.openworldcrafter.com/feedback", true)
        request.setRequestHeader("Content-Type", "application/json")
        request.send(JSON.stringify(formData))
    }, "Send")

    updateModal()

    return modal
}

module.exports.createFeedbackModal = createFeedbackModal
