import getFirstLine from 'firstline'
import glob from 'fast-glob'
import isViewCustom from './is-view-custom.js'
import mm from 'micromatch'

let PATTERNS = {
  filesView: {
    match: ['**/*.view'],
  },
  filesViewLogic: {
    match: ['**/*.view.logic.js'],
  },
  filesViewCustom: {
    match: ['**/*.js'],
    ignore: ['**/*.view.logic.js'],
    filter: async files => {
      let filesFirstLine = await Promise.all(
        files.map(async file => [file, await getFirstLine(file)])
      )

      return filesFirstLine
        .filter(([, firstLine]) => isViewCustom(firstLine))
        .map(([file]) => file)
    },
  },
  filesFontCustom: {
    match: [
      '**/Fonts/*.eot',
      '**/Fonts/*.otf',
      '**/Fonts/*.ttf',
      '**/Fonts/*.svg',
      '**/Fonts/*.woff',
      '**/Fonts/*.woff2',
    ],
  },
}

let MATCH = Object.values(PATTERNS)
  .map(item => item.match)
  .flat()

async function getMatchesPerPattern(files) {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(PATTERNS).map(async ([key, { filter, match, ignore }]) => {
        let matches = mm(files, match, { ignore })
        if (typeof filter === 'function') {
          matches = await filter(matches)
        }
        console.log('matches', key, matches)
        return [key, new Set(matches)]
      })
    )
  )
}

export default async function getFiles(src) {
  let files = await glob(MATCH, {
    absolute: true,
    cwd: src,
    ignore: ['**/node_modules/**', '**/*.view.js'],
  })

  return await getMatchesPerPattern(files)
}
