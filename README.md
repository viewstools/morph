# Views Tools language morpher

[![NPM package](https://img.shields.io/npm/v/@viewstools/morph.svg)](https://www.npmjs.com/package/@viewstools/morph)
[![Build status](https://img.shields.io/travis/viewstools/morph.svg)](https://travis-ci.org/viewstools/morph) [![Greenkeeper badge](https://badges.greenkeeper.io/viewstools/morph.svg)](https://greenkeeper.io/)

[Looking for Views Tools docs?](https://github.com/viewstools/docs)

The easiest way to integrate Views with your project is to [follow this guide](https://github.com/viewstools/docs/tree/master/UseViews).

If you know what you're doing run it as a standalone command. You can install it with:

```
npm install --save-dev @viewstools/morph
```

Then, you can use it with any React or React Native app like this from within
your project's folder:

```
# run on the src directory and morph as react-dom
views-morph src --watch --as react-dom

# run on the current directory and morph as react-native
views-morph . --watch --as react-native

# run on the current directory and morph as both react-native and react-dom
views-morph . --watch --as both
```

If you are morphing for one platform Views morphs `*.view` files into `.*.js`. If you are morphing for both web and native Views morphs `*.view` files into `.*.web.js` and `.*.native.js`. You may want to add those to `.gitignore`:

```
**/*.*.js
```

## Want to contribute?

Brilliant! Check out [CONTRIBUTING.md](https://github.com/viewstools/morph/blob/master/CONTRIBUTING.md) for a step-by-step guide.

See https://views.tools for more info.

License BSD-Clause-3

by UXtemple
