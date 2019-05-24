import { basename, extname } from 'path'
import doMorph from './morphers.js'
import morphFont from './morph/font.js'
import restrictedNames from './restricted-names.js'
import toPascalCase from 'to-pascal-case'
import prettier from 'prettier'

export let morph = ({
  as,
  getFont,
  getSystemImport = () => {},
  isStory,
  local = 'en',
  localSupported = [],
  track = true,
  view,
  viewsById,
  viewsToFiles,
}) => {
  let morphed = doMorph[as]({
    getFont,
    getSystemImport,
    isStory,
    local,
    localSupported,
    track,
    view,
    viewsById,
    viewsToFiles,
  })

  morphed.code = prettier.format(morphed.code, {
    parser: 'babel',
    singleQuote: true,
    trailingComma: 'es5',
  })

  return morphed
}

let sanitize = input =>
  basename(input)
    .replace(extname(input), '')
    .replace(/[^a-zA-Z_$0-9]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/^(\d)/, '_$1')

export let pathToName = path =>
  toPascalCase(sanitize(basename(path).replace('.view', '')))

export let isViewNameRestricted = (view, as) =>
  restrictedNames[as].includes(view)

export { morphFont }
