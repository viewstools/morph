import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
// import pkg from './package.json'

export default {
  input: 'cli.js',
  // external: Object.keys(pkg.dependencies).concat('path'),
  output: {
    banner: `#!/usr/bin/env node\nrequire('source-map-support').install();`,
    file: 'bin.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    json(),
    babel({
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'usage',
            // exclude: ['@babel/plugin-transform-regenerator'],
            targets: {
              node: '10',
            },
            corejs: 3,
          },
        ],
      ],
    }),
  ],
}
