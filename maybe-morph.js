import { promises as fs } from 'fs'
import chalk from 'chalk'
import morphers from './morphers.js'
import prettier from 'prettier'

export default async function maybeMorph({
  as,
  getSystemImport,
  local,
  track,
  view,
  viewsById,
  viewsToFiles,
  verbose,
}) {
  try {
    let result = morphers[as]({
      // getFont,
      getSystemImport,
      // isStory,
      local,
      // localSupported,
      track,
      view,
      viewsById,
      viewsToFiles,
    })

    result.code = prettier.format(result.code, {
      parser: 'babel',
      singleQuote: true,
      trailingComma: 'es5',
    })

    await fs.writeFile(`${view.file}.js`, result.code, 'utf8')

    view.version++

    verbose &&
      console.log(
        `${chalk.green('M')} ${view.id}@${view.version}:${chalk.dim(view.file)}`
      )
  } catch (error) {
    console.error(chalk.red('M'), view, error.codeFrame || error)
  }
}
