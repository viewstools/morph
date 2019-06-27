import {
  getFilesView,
  getFilesViewLogic,
  getFilesViewCustom,
  getFilesFontCustom,
} from './get-files.js'
import { ensureFontsDirectory } from './fonts.js'
import {
  watchFilesView,
  watchFilesViewLogic,
  watchFilesViewCustom,
  watchFilesFontCustom,
} from './watch-files.js'
import makeProcessFiles from './process-files.js'
import chalk from 'chalk'

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

  let [
    filesView,
    filesViewLogic,
    filesViewCustom,
    filesFontCustom,
  ] = await Promise.all([
    getFilesView(src),
    getFilesViewLogic(src),
    getFilesViewCustom(src),
    getFilesFontCustom(src),
  ])

  await processFiles({
    filesFontCustom,
    filesView,
    filesViewCustom,
    filesViewLogic,
  })

  if (verbose) {
    let files = [...viewsToFiles.values()]
      .map(view => {
        if (view.custom) {
          return `${view.id} ${chalk.dim('(custom)')}`
        } else if (view.logic) {
          return `${view.id} ${chalk.dim('(+ logic)')}`
        } else {
          return view.id
        }
      })
      .sort()
      .join(', ')
    console.log(`${chalk.yellow('A')} ${chalk.green('M')} ${files}`)
    if (customFonts.size > 0) {
      console.log(
        chalk.yellow(`\nCustom fonts detected:`),
        [...customFonts.keys()].sort().join(', ')
      )
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
