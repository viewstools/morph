import * as types from './types.js'
import doMorph from './morphers.js'
import prettier from 'prettier'

const DEFAULT_IMPORT = name => `import ${name} from './${name}.view'`

const FORMAT_OPTIONS = {
  // Fit code within this line limit
  printWidth: 80,
  // Number of spaces it should use per tab
  tabWidth: 2,
  // If true, will use single instead of double quotes
  singleQuote: true,
  // Controls the printing of trailing commas wherever possible
  trailingComma: 'all',
  // Controls the printing of spaces inside object literals
  bracketSpacing: true,
  // Which parser to use. Valid options are 'flow' and 'babylon'
  parser: 'babylon',
}

// TODO revisit custom
export const morph = (
  code,
  { as = 'react-dom', custom = [], getImport = DEFAULT_IMPORT, name },
) => {
  const morphed = doMorph[as]({
    custom,
    getImport,
    name,
    view: code,
  })

  return prettier.format(morphed, FORMAT_OPTIONS)
}

export { types }
