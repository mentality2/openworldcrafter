"use strict"

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

module.exports = [
    // editor
    {
        entry: "./src/environment/web.js",
        output: {
            path: path.join(__dirname, "..", "dist", "web"),
            filename: "src/editor.js"
        },
        module: {
            rules: require("./rules.js")
        },
        plugins: [
            new webpack.EnvironmentPlugin(['NODE_ENV', 'OWC_ORIGIN']),
            new CopyWebpackPlugin([
                {
                    from: "./resources/",
                    to: "resources"
                },
            ])
        ]
    }
]
