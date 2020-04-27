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

export default async function watchFiles({ morpher }) {
  let watcher = chokidar.watch(MATCH, {
    cwd: morpher.src,
    ignored: [
      path.join('**', 'node_modules', '**'),
      path.join('**', 'view.js'),
      path.join('**', 'DesignSystem', 'Fonts', '*.js'),
      path.join('**', 'Logic', 'ViewsFlow.js'),
      path.join('**', 'Logic', 'useIsMedia.js'),
      path.join('**', 'Logic', 'useIsBefore.js'),
      path.join('**', 'Logic', 'useIsHovered.js'),
      path.join('**', 'Logic', 'ViewsTools.js'),
      path.join('**', 'Data', 'ViewsData.js'),
    ],
    ignoreInitial: true,
    // awaitWriteFinish: true,
  })

  let skipTimeout = null
  let processEventsPromise = null
  let queue = []

  function onEvent({ file, op }) {
    queue.push({ file: path.join(morpher.src, file), op })
    maybeProcess()
  }

  function maybeProcess() {
    // if busy, try again in a bit
    clearTimeout(skipTimeout)
    skipTimeout = null
    if (processEventsPromise) {
      skipTimeout = setTimeout(maybeProcess, 50)
      return
    }
    processEvents()
  }

  async function processEvents() {
    if (queue.length === 0 || processEventsPromise) {
      return
    }

    let queueClone = [...queue]
    queue = []
    processEventsPromise = new Promise(async resolve => {
      try {
        await processQueue({ queue: queueClone, morpher })
      } catch (error) {
        console.error(error)
      } finally {
        resolve()
        processEventsPromise = null
      }
    })
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

  await Promise.all([
    processUnlinked({
      files: queue.filter(item => item.op === 'unlink'),
      morpher,
      filesToProcess,
    }),
    processAddedOrChanged({
      files: queue.filter(item => item.op !== 'unlink'),
      morpher,
      filesToProcess,
    }),
  ])

  await morpher.processFiles(filesToProcess)

  if (!morpher.verbose) return // && viewsId.size > 0) {

  // Object.entries(filesToProcess).forEach(([key, value]) => {
  //   console.log(chalk.greenBright(key), [...value])
  // })

  //   console.log(chalk.green('M'), [...viewsId].join(', '))
  // }
}

function processUnlinked({ files, morpher, filesToProcess }) {
  return Promise.all(
    files.map(async ({ file }) => {
      morpher.verbose &&
        console.log(
          chalk.magenta('X'),
          path.basename(path.dirname(file)),
          chalk.dim(file.replace(morpher.src, '').replace(/^\//, ''))
        )

      if (await isFontCustomFile(file)) {
        let id = getFontId(file)
        let font = morpher.customFonts.get(id)
        font.delete(file)

        if (font.size === 0) {
          morpher.customFonts.delete(id)
        }
      } else {
        let viewFile = path.join(path.dirname(file), 'view.blocks')
        let view = morpher.viewsToFiles.get(viewFile)
        if (!view) return

        processPointsOfUse({ view, morpher, filesToProcess })

        filesToProcess.filesView.delete(view.file)
        morpher.viewsById.delete(view.id)
        morpher.viewsToFiles.delete(view.file)

        if (await isViewFile(file)) {
          filesToProcess.filesView.delete(file)
          try {
            await fs.unlink(file.replace('view.blocks', 'view.js'))
          } catch (error) {}
        } else if (await isViewLogicFile(file)) {
          filesToProcess.filesView.add(view.file)
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
      morpher.verbose &&
        console.log(
          chalk.yellow(op.toUpperCase()[0]),
          path.basename(path.dirname(file)),
          chalk.dim(file.replace(morpher.src, '').replace(/^\//, ''))
        )

      if (await isFontCustomFile(file)) {
        filesToProcess.filesFontCustom.add(file)
      } else {
        if (await isViewFile(file)) {
          filesToProcess.filesView.add(file)

          let logicFile = path.join(path.dirname(file), 'logic.js')
          if (existsSync(logicFile)) {
            filesToProcess.filesViewLogic.add(logicFile)
          }

          let parentFile = path.join(
            path.dirname(path.dirname(file)),
            'view.blocks'
          )
          if (existsSync(parentFile)) {
            filesToProcess.filesView.add(parentFile)
          }
        } else if (await isViewLogicFile(file)) {
          filesToProcess.filesView.add(
            path.join(path.dirname(file), 'view.blocks')
          )
          filesToProcess.filesViewLogic.add(file)
        } else if (await isViewCustomFile(file)) {
          filesToProcess.filesViewCustom.add(file)
        }

        let viewFile = path.join(path.dirname(file), 'view.blocks')
        let view = morpher.viewsToFiles.get(viewFile)
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
