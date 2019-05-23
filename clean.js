import glob from 'fast-glob'
import { promises as fs } from 'fs'
import path from 'path'

export default async function clean(src) {
  let morphed = await glob(['**/*.view.js', `Fonts/*.js`, 'use-flow.js'], {
    bashNative: ['linux'],
    cwd: src,
    ignore: ['*node_modules*'],
  })

  return Promise.all(
    morphed.map(f => {
      console.log(`x ${f}`)
      return fs.unlink(path.join(src, f))
    })
  )
}
