import { basename, extname } from 'path'
import doMorph from './morphers.js'
import morphFont from './morph/font.js'
import restrictedNames from './restricted-names.js'
import toPascalCase from 'to-pascal-case'
import prettier from 'prettier'
import parse from './parse/index.js'

let DEFAULT_IMPORT = name => `import ${name} from './${name}.view.js'`

export let morph = ({
  as,
  enableAnimated,
  file = {},
  getFont,
  getImport = DEFAULT_IMPORT,
  isStory,
  local = 'en',
  localSupported = [],
  name,
  track = true,
  views = {},
}) => {
  let morphed = doMorph[as]({
    enableAnimated,
    file,
    getFont,
    getImport,
    isStory,
    local,
    localSupported,
    name,
    track,
    views,
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

export { parse }
