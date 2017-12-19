"use strict"

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = [
    // cordova app
    {
        entry: "./src/environment/app.js",
        output: {
            path: path.join(__dirname, "..", "dist", "app"),
            filename: "js/editor.js"
        },
        module: {
            rules: require("./rules.js")
        },
        plugins: [
            new CopyWebpackPlugin([
                {
                    from: "./src/styles/css",
                    to: "styles"
                },
                {
                    from: "./src/styles/cantarell",
                    to: "cantarell"
                },
                {
                    from: "./src/styles/noto_emoji",
                    to: "noto_emoji"
                },
                {
                    from: "./build/icons",
                    to: "icons"
                },
                {
                    from: "./dist/docs",
                    to: "docs"
                }
            ])
        ]
    }
]
