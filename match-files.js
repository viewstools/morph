import getFirstLine from 'firstline'
import isViewCustom from './is-view-custom.js'
import mm from 'micromatch'

export let PATTERNS = {
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

// @ts-ignore
export let isViewFile = async file => mm.isMatch(file, PATTERNS.filesView.match)
export let isViewLogicFile = async file =>
  // @ts-ignore
  mm.isMatch(file, PATTERNS.filesViewLogic.match)
export let isViewCustomFile = async file =>
  // @ts-ignore
  mm.isMatch(file, PATTERNS.filesViewCustom.match) &&
  (await PATTERNS.filesViewCustom.filter([file])).length > 0
export let isFontCustomFile = async file =>
  // @ts-ignore
  mm.isMatch(file, PATTERNS.filesFontCustom.match)

export let MATCH = Object.values(PATTERNS)
  .map(item => item.match)
  .flat()

export async function getMatchesPerPattern(files) {
  // @ts-ignore
  return Object.fromEntries(
    await Promise.all(
      Object.entries(PATTERNS).map(async ([key, { filter, match, ignore }]) => {
        let matches = mm(files, match, { ignore })
        if (typeof filter === 'function') {
          matches = await filter(matches)
        }
        return [key, new Set(matches)]
      })
    )
  )
}
