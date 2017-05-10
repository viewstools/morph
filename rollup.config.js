import babel from 'rollup-plugin-babel'

export default {
  entry: 'index.js',
  external: Object.keys(require('./package.json').dependencies).concat('path'),
  dest: 'lib.js',
  format: 'cjs',
  plugins: [
    babel({
      plugins: ['external-helpers', 'transform-object-rest-spread'],
    }),
  ],
}
