import { ensureFontsDirectory } from './fonts.js'
import {
  watchFilesView,
  watchFilesViewLogic,
  watchFilesViewCustom,
  watchFilesFontCustom,
} from './watch-files.js'
import getFiles from './get-files.js'
import makeProcessFiles from './process-files.js'
import chalk from 'chalk'
import path from 'path'

export default async function watch({
  as = 'react-dom',
  local = 'en',
  once = false,
  src,
  tools = false,
  track = false,
  verbose = true,
}) {
  let customFonts = new Map()
  let viewsById = new Map()
  let viewsToFiles = new Map()

  let processFiles = makeProcessFiles({
    as,
    customFonts,
    local,
    tools,
    track,
    src,
    verbose,
    viewsById,
    viewsToFiles,
  })

  await ensureFontsDirectory(src)

  let {
    filesView,
    filesViewLogic,
    filesViewCustom,
    filesFontCustom,
  } = await getFiles(src)

  await processFiles({
    filesFontCustom,
    filesView,
    filesViewCustom,
    filesViewLogic,
  })

  if (verbose) {
    console.log(
      [...viewsToFiles.values()]
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
    if (customFonts.size > 0) {
      console.log(chalk.yellow(`\nCustom fonts detected:`))
      console.log([...customFonts.keys()].sort().join('\n'))
    }
  }

  if (once) return

  watchFilesView({
    filesViewLogic,
    processFiles,
    src,
    verbose,
    viewsById,
    viewsToFiles,
  })

  watchFilesViewCustom({
    filesViewLogic,
    processFiles,
    src,
    verbose,
    viewsById,
    viewsToFiles,
  })

  watchFilesViewLogic({
    filesViewLogic,
    processFiles,
    src,
    verbose,
    viewsToFiles,
  })

  watchFilesFontCustom({
    customFonts,
    filesViewLogic,
    processFiles,
    src,
    verbose,
    viewsById,
    viewsToFiles,
  })
}
