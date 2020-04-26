import mm from 'micromatch'

export let PATTERNS = {
  filesView: {
    match: ['**/view.blocks'],
  },
  filesViewLogic: {
    match: ['**/logic.js'],
  },
  filesViewCustom: {
    match: ['**/react.js'],
  },
  filesFontCustom: {
    match: [
      '**/DesignSystem/Fonts/*.eot',
      '**/DesignSystem/Fonts/*.otf',
      '**/DesignSystem/Fonts/*.ttf',
      '**/DesignSystem/Fonts/*.svg',
      '**/DesignSystem/Fonts/*.woff',
      '**/DesignSystem/Fonts/*.woff2',
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
  mm.isMatch(file, PATTERNS.filesViewCustom.match)
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
