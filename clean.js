import { promises as fs } from 'fs'
import deleteEmpty from 'delete-empty'
import glob from 'fast-glob'
import path from 'path'

export default async function clean(src) {
  let morphed = await glob(['**/*.view.js', `Fonts/*.js`, 'use-flow.js'], {
    bashNative: ['linux'],
    cwd: src,
    ignore: ['*node_modules*'],
  })

  await Promise.all(
    morphed.map(f => {
      console.log(`x ${f}`)
      return fs.unlink(path.join(src, f))
    })
  )

  let deleted = await deleteEmpty(src)
  deleted.forEach(d => console.log(`x ${d}`))
}
