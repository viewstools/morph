import ensureDir from './ensure-dir.js'
import path from 'path'
import prettier from 'prettier'

export default async function ensureFile({ file, content }) {
  await ensureDir(path.dirname(file))

  return {
    file,
    content: prettier.format(content, {
      parser: 'babel',
      singleQuote: true,
      trailingComma: 'es5',
    }),
  }
}
