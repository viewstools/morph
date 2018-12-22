import { basename, extname } from 'path'
import buble from 'buble'
import doMorph from './morphers.js'
import doGetViewNotFound from './get-view-not-found.js'
import morphFont from './morph/font.js'
import restrictedNames from './restricted-names.js'
import toPascalCase from 'to-pascal-case'
import prettier from 'prettier'
import parse from './parse/index.js'

debugger
const DEFAULT_IMPORT = (name, as, shouldWriteBoth) =>
  `import ${name} from './${name}${getExtension(as, shouldWriteBoth)}'`

export const morph = ({
  as,
  compile,
  enableAnimated,
  file = {},
  getFont,
  getImport = DEFAULT_IMPORT,
  local = 'en',
  localSupported = [],
  name,
  pretty = false,
  shouldWriteBoth,
  track = true,
  views = {},
}) => {
  debugger
  let morphed = doMorph[as]({
    enableAnimated,
    file,
    getFont,
    getImport,
    local,
    localSupported,
    name,
    shouldWriteBoth,
    track,
    views,
  })

  if (compile) {
    morphed.code = buble.transform(morphed.code, {
      objectAssign: 'Object.assign',
      transforms: {
        modules: false,
        templateString: false,
      },
    }).code
  }

  if (pretty) {
    morphed.code = prettier.format(morphed.code, {
      parser: 'babylon',
      singleQuote: true,
      trailingComma: 'es5',
    })
  }

  return morphed
}

export const getExtension = (as, shouldWriteBoth) => {
  if (as === 'e2e') {
    return '.page.js'
  }
  if (shouldWriteBoth && as === 'react-dom') {
    return '.web.js'
  }
  if (shouldWriteBoth && as === 'react-native') {
    return '.native.js'
  }
  return '.js'
}

export const getViewNotFound = (as, name, warning) =>
  doGetViewNotFound[as](name, warning)

const sanitize = input =>
  basename(input)
    .replace(extname(input), '')
    .replace(/[^a-zA-Z_$0-9]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/^(\d)/, '_$1')

export const pathToName = path =>
  toPascalCase(sanitize(basename(path).replace('.view', '')))

export const isViewNameRestricted = (view, as) =>
  restrictedNames[as].includes(view)

export { morphFont }

export { parse }
