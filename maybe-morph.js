import chalk from 'chalk'
import morphers from './morphers.js'
import prettier from 'prettier'

export default function maybeMorph({
  as,
  getFontImport,
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
      getFontImport,
      getSystemImport,
      // isStory,
      local,
      // localSupported,
      track,
      view,
      viewsById,
      viewsToFiles,
    })

    view.version++

    verbose &&
      console.log(
        `${chalk.green('M')} ${view.id}@${view.version}:${chalk.dim(view.file)}`
      )

    return prettier.format(result.code, {
      parser: 'babel',
      singleQuote: true,
      trailingComma: 'es5',
    })
  } catch (error) {
    console.error(chalk.red('M'), view, error.codeFrame || error)
    return null
  }
}
