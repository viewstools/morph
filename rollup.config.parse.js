import babel from 'rollup-plugin-babel'

export default {
  entry: 'parse/index.js',
  external: Object.keys(require('./package.json').dependencies).concat('path'),
  dest: 'parse.js',
  format: 'cjs',
  plugins: [
    babel({
      plugins: ['external-helpers', 'transform-object-rest-spread'],
    }),
  ],
}
