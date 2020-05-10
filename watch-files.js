import {
  MATCH,
  isFontCustomFile,
  isViewCustomFile,
  isViewFile,
  isViewLogicFile,
} from './match-files.js'
import { debounce } from 'debounce'
import { promises as fs, existsSync } from 'fs'
import { getFontId } from './fonts.js'
import chalk from 'chalk'
import chokidar from 'chokidar'
import getPointsOfUse from './get-points-of-use.js'
import path from 'path'

export default async function watchFiles({ morpher }) {
  let watcher = chokidar.watch(MATCH, {
    cwd: morpher.src,
    ignored: ['**/view.js', 'DesignSystem/Fonts/*.js'],
    ignoreInitial: true,
    // awaitWriteFinish: true,
  })

  let processing = false
  let queue = []
  let processEvents = debounce(async () => {
    if (queue.length === 0 || processing) {
      return
    }

    let queueClone = [...queue]
    queue = []

    processing = true
    try {
      await processQueue({ queue: queueClone, morpher })
    } catch (error) {
      console.error(error)
      process.exit(1)
    }
    processing = false

    if (queue.length > 0) {
      processEvents()
    }
  }, 10)

  function onEvent({ file, op }) {
    queue.push({ file: path.join(morpher.src, file), op })
    processEvents()
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

  processAddedOrChanged({
    files: queue.filter(item => item.op !== 'unlink'),
    morpher,
    filesToProcess,
  })

  await processUnlinked({
    files: queue.filter(item => item.op === 'unlink'),
    morpher,
    filesToProcess,
  })

  return morpher.processFiles(filesToProcess)
}

async function processUnlinked({ files, morpher, filesToProcess }) {
  await Promise.all(
    files.map(async ({ file }) => {
      morpher.verbose &&
        console.log(
          chalk.magenta('X'),
          path.basename(path.dirname(file)),
          chalk.dim(file.replace(morpher.src, '').replace(/^\//, ''))
        )

      if (isFontCustomFile(file)) {
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

        if (isViewFile(file)) {
          filesToProcess.filesView.delete(file)
          try {
            await fs.unlink(file.replace('view.blocks', 'view.js'))
          } catch (error) {}
        } else if (isViewLogicFile(file)) {
          if (files.every(item => item.file !== view.file)) {
            filesToProcess.filesView.add(view.file)
          }
          filesToProcess.filesViewLogic.delete(file)
        } else if (isViewCustomFile(file)) {
          filesToProcess.filesViewCustom.delete(file)
        }
      }
    })
  )
}

function processAddedOrChanged({ files, morpher, filesToProcess }) {
  files.forEach(({ file, op }) => {
    morpher.verbose &&
      console.log(
        chalk.yellow(op.toUpperCase()[0]),
        path.basename(path.dirname(file)),
        chalk.dim(file.replace(morpher.src, '').replace(/^\//, ''))
      )

    if (isFontCustomFile(file)) {
      filesToProcess.filesFontCustom.add(file)
    } else {
      if (isViewFile(file)) {
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
      } else if (isViewLogicFile(file)) {
        filesToProcess.filesView.add(
          path.join(path.dirname(file), 'view.blocks')
        )
        filesToProcess.filesViewLogic.add(file)
      } else if (isViewCustomFile(file)) {
        filesToProcess.filesViewCustom.add(file)
      }

      let viewFile = path.join(path.dirname(file), 'view.blocks')
      let view = morpher.viewsToFiles.get(viewFile)
      if (!view) return

      processPointsOfUse({ view, morpher, filesToProcess })
    }
  })
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
