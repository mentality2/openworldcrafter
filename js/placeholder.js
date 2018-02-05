"use strict"

// Creates a placeholder page so the screen doesn't flash while the content is
// loading

const html = document.documentElement

html.style.backgroundColor = {
    theme_dark: "#333",
    theme_light: "#ccc"
}[localStorage["openworldcrafter.preferences.theme"] || "theme_light"]
document.body.style.display = "none"

html.style.backgroundImage="url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48c3R5bGU+Knt0cmFuc2Zvcm0tb3JpZ2luOiBjZW50ZXJ9LmJ7c3Ryb2tlOiMyNjc5RkY7ZmlsbDpub25lO3N0cm9rZS13aWR0aDoxMDtzdHJva2UtbGluZWNhcDpyb3VuZDthbmltYXRpb246ZCAxLjVzIGVhc2UtaW4tb3V0IGluZmluaXRlO3N0cm9rZS1kYXNoYXJyYXk6MjgzfUBrZXlmcmFtZXMgY3swJXt0cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9MTAwJSB7dHJhbnNmb3JtOnJvdGF0ZSgwZGVnKX19QGtleWZyYW1lcyBkezAle3N0cm9rZS1kYXNob2Zmc2V0OjE0Mjt0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9NTAle3N0cm9rZS1kYXNob2Zmc2V0OjI4Mzt0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9MTAwJXtzdHJva2UtZGFzaG9mZnNldDogMTQyO3RyYW5zZm9ybTogcm90YXRlKDBkZWcpfX0uZXt9PC9zdHlsZT48ZyBzdHlsZT0iYW5pbWF0aW9uOmMgMThzIHN0ZXBzKDEyKSBpbmZpbml0ZSI+PGcgY2xhc3M9ImIiPjxjaXJjbGUgdHJhbnNmb3JtPSJyb3RhdGUoMTgwKSIgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1Ij48L2NpcmNsZT48L2c+PGcgY2xhc3M9ImIiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1Ij48L2NpcmNsZT48L2c+PC9nPjwvc3ZnPg=="
html.style.backgroundSize="50px"
html.style.backgroundPosition="50%"
html.style.backgroundRepeat="no-repeat"
html.style.height = html.style.width = "100%"

function removePlaceholder() {
    document.body.style.removeProperty("display")
    html.style.removeProperty("background")
    html.style.removeProperty("height")
    html.style.removeProperty("width")
}

var $placeholder = {
    removePlaceholder
}
