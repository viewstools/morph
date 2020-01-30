import { ensureFontsDirectory } from './fonts.js'
import getFiles from './get-files.js'
import chalk from 'chalk'
import makeMorpher from './make-morpher.js'
import maybePrintWarnings from './maybe-print-warnings.js'
import path from 'path'
import watchFiles from './watch-files.js'

export default async function watch(options) {
  let morpher = makeMorpher(options)

  await ensureFontsDirectory(morpher.src)

  await morpher.processFiles(await getFiles(morpher.src))

  if (options.verbose) {
    if (morpher.customFonts.size > 0) {
      console.log(chalk.yellow(`\nCustom fonts detected:`))
      console.log([...morpher.customFonts.keys()].sort().join('\n'))
    }

    let views = [...morpher.viewsToFiles.values()]
    console.log(
      views
        .map(view => {
          let msg = view.id
          if (view.custom) {
            msg = `${view.id} ${chalk.dim('(is custom)')}`
          } else if (view.logic) {
            msg = `${view.id} ${chalk.dim('(has logic)')}`
          }
          return `${chalk.yellow('A')} ${chalk.green('M')} ${msg} ${chalk.dim(
            path.relative(process.cwd(), view.file)
          )}`
        })
        .sort()
        .join('\n')
    )

    views.forEach(maybePrintWarnings)
  }

  if (options.once) return

  let watcher = watchFiles({ morpher })

  process.on('beforeExit', () => {
    console.log('Stopping Views morpher file watcher...')
    watcher.close()
  })
}
