import { getMatchesPerPattern, MATCH } from './match-files.js'
import glob from 'fast-glob'

export default async function getFiles(src) {
  let files = await glob(MATCH, {
    absolute: true,
    cwd: src,
    ignore: ['**/view.js'],
  })

  return getMatchesPerPattern(files)
}
