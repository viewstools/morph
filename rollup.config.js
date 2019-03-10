import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default {
  input: 'index.js',
  external: Object.keys(pkg.dependencies).concat('path'),
  output: {
    file: 'lib.js',
    format: 'cjs',
    sourcemap: false,
  },
  plugins: [
    babel({
      babelrc: false,
      presets: [['@babel/preset-env', { modules: false, useBuiltIns: false }]],
    }),
  ],
}
