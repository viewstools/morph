import { basename, extname } from 'path'
import buble from 'buble'
import doMorph from './morphers.js'
import doGetViewNotFound from './get-view-not-found.js'
import morphFont from './morph/font.js'
import restrictedNames from './restricted-names.js'
import toPascalCase from 'to-pascal-case'
import prettier from 'prettier'
import parse from './parse/index.js'

const DEFAULT_IMPORT = name => `import ${name} from './${name}.view.js'`

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
  track = true,
  views = {},
}) => {
  let morphed = doMorph[as]({
    enableAnimated,
    file,
    getFont,
    getImport,
    local,
    localSupported,
    name,
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
      parser: 'babel',
      singleQuote: true,
      trailingComma: 'es5',
    })
  }

  return morphed
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
