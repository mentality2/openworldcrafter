![open world crafter](./resources/docs/logos/header.png)

This is the git repository for openworldcrafter. This page contains information
for developers and contributors; for user information, go to
<https://www.openworldcrafter.com>.

# Installing from Source
First, you will need to install [nodejs](https://nodejs.org/en/). Then, you will
need to
[clone this repository](https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository)
to your computer.

I use [Yarn](https://yarnpkg.com/en/) as a package manager, but npm (which is
installed with nodejs) should work as well. If you're using Yarn, just run
`yarn`. If you're using npm, run `npm install`. This will download all the
packages you'll need in order to build and run openworldcrafter.

Now, you'll need to build everything. Assuming you're trying to build the
desktop version, run `yarn run compile-all` or `npm run-script compile-all`.
Then run `yarn start` or `npm start` to launch the program.

# Contributing
This is an open-source project, and contributions are welcome! Please remember
to be nice and respect others. If you have a question or need help with
something, create a new issue on
[the issue tracker](https://github.com/openworldcrafter/openworldcrafter/issues). If you would like
to contribute a feature, please create an issue *before* you start working on
it.

# Copyright Notice
Copyright 2017-2018 FlyingPiMonster <contact@openworldcrafter.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use these files except in compliance with the License.
You may obtain a copy of the License at

<http://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
