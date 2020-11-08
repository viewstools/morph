import { ensureFontsDirectory } from './fonts.js'
import pkg from './package.json'
import getFiles from './get-files.js'
import chalk from 'chalk'
import makeMorpher from './make-morpher.js'
import maybePrintWarnings from './maybe-print-warnings.js'
import path from 'path'
import watchFiles from './watch-files.js'

export default async function watch(options) {
  console.time('startup time')
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
        .map((view) => {
          let msg = view.id
          if (view.custom) {
            msg = `${view.id} ${chalk.dim('(is custom)')}`
          } else if (view.logic) {
            msg = `${view.id} ${chalk.dim('(has logic)')}`
          }
          return `${chalk.yellow('A')} ${chalk.green('M')} ${msg} ${chalk.dim(
            path.relative(morpher.src, view.file)
          )}`
        })
        .sort()
        .join('\n')
    )

    views.forEach(maybePrintWarnings)
  }

  if (options.verbose) {
    console.log(
      chalk.underline(
        `Views Tools morpher v${
          __filename.endsWith('bin.js') ? pkg.version : 'DEVELOPMENT'
        }`
      )
    )

    console.log(
      `\nWill morph files at "${chalk.green(options.src)}" as "${chalk.green(
        options.as
      )}" ${options.tools ? 'with Views Tools' : 'without Views Tools'}`
    )

    if (!options.once && !options.tools) {
      console.log(
        chalk.bgRed('                                               ')
      )
      console.log()
      console.log(`🚨 You're missing out!!!`)
      console.log(
        chalk.bold(
          '🚀 Views Tools can help you find product market\n   fit before you run out of money.'
        )
      )
      console.log()
      console.log(
        '✨ Find out how 👉',
        chalk.bold(chalk.green('https://views.tools'))
      )
      console.log()
      console.log(
        chalk.bgRed('                                               ')
      )
    }

    console.log(chalk.yellow('A'), '= Added')
    console.log(chalk.green('M'), `= Morphed`)
    console.log(chalk.magenta('X'), `= Deleted`)
  }

  console.log(chalk.green('Views Morpher is ready'))
  console.timeEnd('startup time')
  if (options.once) return

  console.log('\nPress', chalk.blue('ctrl+c'), 'to stop at any time.\n')
  let watcher = watchFiles({ morpher })

  process.on('beforeExit', () => {
    console.log('Stopping Views morpher file watcher...')
    watcher.close()
  })
}
