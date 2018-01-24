"use strict"

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

module.exports = [
    {
        entry: "./src/environment/desktop.js",
        output: {
            path: path.join(__dirname, "..", "dist", "desktop"),
            filename: "js/bundle.js"
        },
        module: {
            rules: require("./rules.js")
        },
        plugins: [
            new webpack.EnvironmentPlugin(['NODE_ENV', 'OWC_ORIGIN', 'OWC_COMMIT_ID']),
            new CopyWebpackPlugin([
                {
                    from: "./resources",
                    to: "resources"
                },
                {
                    from: "./pages",
                    to: "pages"
                },
                {
                    from: "./build",
                    to: "build"
                }
            ])
        ]
    }
]
