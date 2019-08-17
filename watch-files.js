import {
  MATCH,
  isFontCustomFile,
  isViewCustomFile,
  isViewFile,
  isViewLogicFile,
} from './match-files.js'
import { promises as fs, existsSync } from 'fs'
import { getFontId } from './fonts.js'
import chalk from 'chalk'
import chokidar from 'chokidar'
import getPointsOfUse from './get-points-of-use.js'
import path from 'path'

export default function watchFiles(morpher) {
  let watcher = chokidar.watch(MATCH, {
    cwd: morpher.src,
    ignored: [
      '**/node_modules/**',
      '**/*.view.js',
      'useFlow.js',
      'useIsMedia.js',
      'useIsBefore.js',
      'useTools.js',
    ],
    ignoreInitial: true,
    // awaitWriteFinish: true,
  })

  let timeout = null
  let queue = []
  function onEvent({ file, op }) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    queue.push({ file: path.join(morpher.src, file), op })

    timeout = setTimeout(() => {
      timeout = null
      processQueue({ queue: [...queue], morpher })
      queue = []
    }, 1500)
  }

  watcher.on('add', file => onEvent({ file, op: 'add' }))
  watcher.on('change', file => onEvent({ file, op: 'change' }))
  watcher.on('unlink', file => onEvent({ file, op: 'unlink' }))

  return watcher
}

async function processQueue({ queue, morpher }) {
  let filesToProcess = {
    filesView: new Set(),
    filesViewLogic: new Set(),
    filesViewCustom: new Set(),
    filesFontCustom: new Set(),
  }

  await processUnlinked({
    files: queue.filter(item => item.op === 'unlink'),
    morpher,
    filesToProcess,
  })

  await processAddedOrChanged({
    files: queue.filter(item => item.op !== 'unlink'),
    morpher,
    filesToProcess,
  })

  await morpher.processFiles(filesToProcess)

  if (!morpher.verbose) return // && viewsId.size > 0) {

  Object.entries(filesToProcess).forEach(([key, value]) => {
    console.log(chalk.greenBright(key), [...value])
  })

  //   console.log(chalk.green('M'), [...viewsId].join(', '))
  // }
}

function processUnlinked({ files, morpher, filesToProcess }) {
  return Promise.all(
    files.map(async ({ file }) => {
      morpher.verbose && console.log(chalk.magenta('X'), file) // view.id, chalk.dim(`-> ${file}`))

      if (await isFontCustomFile(file)) {
        let id = getFontId(file)
        let font = morpher.customFonts.get(id)
        font.delete(file)

        if (font.size === 0) {
          morpher.customFonts.delete(id)
        }
      } else {
        let view = morpher.viewsToFiles.get(
          file.replace('.view.logic.js', '.view')
        )
        if (!view) return

        processPointsOfUse({ view, morpher, filesToProcess })

        filesToProcess.filesView.delete(view.file)

        morpher.viewsById.delete(view.id)
        morpher.viewsToFiles.delete(view.file)

        try {
          fs.unlink(`${view.file}.js`)
        } catch (error) {}

        if (await isViewFile(file)) {
          filesToProcess.filesView.delete(file)
        } else if (await isViewLogicFile(file)) {
          filesToProcess.filesViewLogic.delete(file)
        } else if (await isViewCustomFile(file)) {
          filesToProcess.filesViewCustom.delete(file)
        }
      }
    })
  )
}

function processAddedOrChanged({ files, morpher, filesToProcess }) {
  return Promise.all(
    files.map(async ({ file, op }) => {
      morpher.verbose && console.log(chalk.yellow(op), file)

      if (await isFontCustomFile(file)) {
        filesToProcess.filesFontCustom.add(file)
      } else {
        if (await isViewFile(file)) {
          filesToProcess.filesView.add(file)

          let logicFile = `${file}.logic.js`
          if (existsSync(logicFile)) {
            filesToProcess.filesViewLogic.add(logicFile)
          }
        } else if (await isViewLogicFile(file)) {
          filesToProcess.filesViewLogic.add(file)
        } else if (await isViewCustomFile(file)) {
          filesToProcess.filesViewCustom.add(file)
        }

        let view = morpher.viewsToFiles.get(
          file.replace('.view.logic.js', '.view')
        )
        if (!view) return

        processPointsOfUse({ view, morpher, filesToProcess })
      }

      // morpher.verbose &&
      //   console.log(
      //     op === 'add'
      //       ? `${chalk.yellow('A')} ${chalk.green('M')}`
      //       : chalk.green('M'),
      //     getViewIdFromFile(file),
      //     chalk.dim(`-> ${file}`)
      //   )
    })
  )
}

function processPointsOfUse({ view, morpher, filesToProcess }) {
  let { filesView, filesViewLogic } = getPointsOfUse({
    view,
    viewsToFiles: morpher.viewsToFiles,
  })
  for (let file of filesView) {
    filesToProcess.filesView.add(file)
  }
  for (let file of filesViewLogic) {
    filesToProcess.filesViewLogic.add(file)
  }
}
