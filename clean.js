let glob = require('fast-glob')
let fs = require('fs')
let path = require('path')

module.exports = async src => {
  let options = {
    bashNative: ['linux'],
    cwd: src,
    ignore: ['*node_modules*'],
    // filter: f => !/node_modules/.test(f),
  }

  let created = await glob(['**/*.view', '**/*.view.logic.js'], options)

  let morphed = await glob(['**/*.view.js'], options)

  let toRemove = morphed.filter(m => !created.includes(m.replace(/\.js$/, '')))

  toRemove.forEach(f => fs.unlinkSync(path.join(src, f)))
}
