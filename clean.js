const glob = require('fast-glob')
const fs = require('fs')
const path = require('path')

module.exports = async src => {
  const options = {
    bashNative: ['linux'],
    cwd: src,
    ignore: ['*node_modules*'],
    // filter: f => !/node_modules/.test(f),
  }

  const created = await glob(
    ['**/*.view', '**/*.logic.js', '**/*.view.tests'],
    options
  )

  const morphed = await glob(
    ['**/*.view.css', '**/*.view.js', '**/*.view.tests.js'],
    options
  )

  const toRemove = morphed.filter(
    m => !created.includes(m.replace(/\.(js|css)$/, ''))
  )

  toRemove.forEach(f => fs.unlinkSync(path.join(src, f)))
}
