import * as types from './types.js'
import doMorph from './morphers.js'
import prettier from 'prettier'

const DEFAULT_IMPORT = name => `import ${name} from './${name}.view'`

export const morph = (
  code,
  { as, getImport = DEFAULT_IMPORT, name, pretty = false }
) => {
  const morphed = doMorph[as]({
    getImport,
    name,
    view: code,
  })

  return pretty
    ? prettier.format(morphed, {
        singleQuote: true,
        trailingComma: 'es5',
      })
    : morphed
}

export { types }
