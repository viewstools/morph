import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default {
  input: 'index.js',
  external: Object.keys(pkg.dependencies).concat('path'),
  output: {
    file: 'lib.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    babel({
      plugins: ['external-helpers', 'transform-object-rest-spread'],
      presets: [
        [
          'env',
          {
            targets: {
              // React parses on ie 9, so we should too
              ie: 11,
              // We currently minify with uglify
              // Remove after https://github.com/mishoo/UglifyJS2/issues/448
              uglify: true,
            },
            // Disable polyfill transforms
            useBuiltIns: false,
            // Do not transform modules to CJS
            modules: false,
          },
        ],
      ],
    }),
  ],
}
