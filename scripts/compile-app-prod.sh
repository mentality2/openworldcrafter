#!/bin/bash

# check for uncommitted changes

if [[ -n $(git status -s) ]]; then
    echo "There are uncomitted changes! Please commit or stash them before building for production. All production builds must be compiled from committed code."
elif [[ -z $OWC_ORIGIN ]]; then
    echo "You must specify an OWC_ORIGIN to build for production."
else
    echo "Compiling app from build $(git rev-parse HEAD)"

    # run other builds
    yarn run compile-all

    NODE_ENV=production OWC_COMMIT_ID=$(git rev-parse HEAD) webpack --config webpack/app.webpack.config.js -p
fi
