# Views language morpher

[There are some docs!!!](https://github.com/viewsdx/docs)

The easiest way to integrate Views with your project is to run it as a
standalone command. You can install it with:

```
npm install --save-dev views-morph
```

Then, you can use it with any React or React Native app like this from within
your project's folder:

```
# run on the src directory and morph as react-dom
views-morph src --watch --as react-dom

# run on the current directory and morph as react-native
views-morph . --watch --as react-dom
```

Views will create `.js` files for every file type it morphs (`.view`, `.data` and `.view.tests`).
Feel free to add those files to `.gitignore` like:

```
**/*.data.js
**/*.view.js
**/*.view.css
**/*.view.tests.js
```

[Use with rollup](https://github.com/viewsdx/rollup-plugin-views)
[Use with webpack](https://github.com/viewsdx/webpack-views-loader)

See viewsdx.com for more info.

License BSD-Clause-3

by UXtemple
