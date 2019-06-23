import { promises as fs } from 'fs'
import deleteEmpty from 'delete-empty'
import glob from 'fast-glob'
import path from 'path'

export default async function clean(src, verbose) {
  let morphed = await glob(
    [
      '**/*.view.js',
      `Fonts/*.js`,
      'useFlow.js',
      'useIsMedia.js',
      'useIsBefore.js',
      'useTools.js',
    ],
    {
      bashNative: ['linux'],
      cwd: src,
      ignore: ['*node_modules*'],
    }
  )

  await Promise.all(
    morphed.map(f => {
      verbose && console.log(`x ${f}`)
      return fs.unlink(path.join(src, f))
    })
  )

  let deleted = await deleteEmpty(src)
  if (verbose) {
    deleted.forEach(d => console.log(`x ${d}`))
  }
}
