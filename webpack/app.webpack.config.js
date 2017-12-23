"use strict"

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

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
            new webpack.EnvironmentPlugin(['NODE_ENV', 'OWF_ORIGIN']),
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
