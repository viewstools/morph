import mm from 'micromatch'

let PATTERNS = {
  filesView: ['**/App/**/view.blocks', '**/DesignSystem/**/view.blocks'],
  filesViewLogic: ['**/App/**/logic.js', '**/DesignSystem/**/logic.js'],
  filesViewGraphql: ['**/App/**/*.graphql'],
  filesViewDataGraphql: ['**/App/**/data.graphql'],
  filesViewCustom: ['**/DesignSystem/**/react.js'],
  filesFontCustom: [
    '**/DesignSystem/Fonts/*.eot',
    '**/DesignSystem/Fonts/*.otf',
    '**/DesignSystem/Fonts/*.ttf',
    '**/DesignSystem/Fonts/*.svg',
    '**/DesignSystem/Fonts/*.woff',
    '**/DesignSystem/Fonts/*.woff2',
  ],
}

export let isViewFile = (file) => mm.isMatch(file, PATTERNS.filesView)
export let isViewLogicFile = (file) => mm.isMatch(file, PATTERNS.filesViewLogic)
export let isViewGraphqlFile = (file) =>
  mm.isMatch(file, PATTERNS.filesViewGraphql)
export let isViewDataGraphqlFile = (file) =>
  mm.isMatch(file, PATTERNS.filesViewDataGraphql)
export let isViewCustomFile = (file) =>
  mm.isMatch(file, PATTERNS.filesViewCustom)
export let isFontCustomFile = (file) =>
  mm.isMatch(file, PATTERNS.filesFontCustom)

export let MATCH = ['App/**', 'DesignSystem/**']

export function getMatchesPerPattern(files) {
  return Object.fromEntries(
    Object.entries(PATTERNS).map(([key, match]) => [
      key,
      new Set(mm(files, match)),
    ])
  )
}
