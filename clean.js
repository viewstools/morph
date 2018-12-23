const glob = require('fast-glob')
const fs = require('fs')
const path = require('path')

module.exports = async src => {
  const options = {
    bashNative: ['linux'],
    cwd: src,
    ignore: ['**node_modules/**'],
    // filter: f => !/node_modules/.test(f),
  }

  const created = await glob(
    ['**/*.view', '**/*.view.logic.js', '**/*.view.tests'],
    options
  )

  const morphed = await glob(
    ['**/*.view.css', '**/.*.js', '**/*.view.tests.js'],
    options
  )

  const toRemove = morphed.filter(m => {
    const match = m
      .match(/^([a-zA-Z/]*\/)?(?:\.)([a-zA-Z]*)(?:.*[.js]$)/)
      .filter(Boolean)

    const pattern = match[2]
      ? `${match[1]}${match[2]}.view`
      : `${match[1]}.view`

    return (
      !created.includes(m.replace(/\.(css)$/, '')) && !created.includes(pattern)
    )
  })

  toRemove.forEach(f => fs.unlinkSync(path.join(src, f)))
}
