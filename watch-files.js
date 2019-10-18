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
import runCra from './runCra.js'

export default async function watchFiles({ morpher, serve }) {
  let watcher = chokidar.watch(MATCH, {
    cwd: morpher.src,
    ignored: [
      '**/node_modules/**',
      '**/*.view.js',
      '**/Fonts/*.js',
      'useFlow.js',
      'useIsMedia.js',
      'useIsBefore.js',
      'useTools.js',
      'useData.js',
    ],
    ignoreInitial: true,
    awaitWriteFinish: true,
  })
  let compiler = null
  if (serve) {
    compiler = await runCra()
    //let beforeRunTimeout = null
    const awaitProcessEventsPromise = s => {
      //console.log('Tap Changed files:',Object.keys(s.watchFileSystem.watcher.mtimes))

      if (processEventsPromise) {
        console.log('Morpher busy, wait')
        return processEventsPromise
      } else {
        return Promise.resolve()
        // return new Promise( (res,rej)=>{
        //   clearTimeout(beforeRunTimeout)
        //   beforeRunTimeout = null
        //   //give the morpher a chance to start
        //   beforeRunTimeout = setTimeout(async ()=>{
        //     console.log(`${!!processEventsPromise?"Morpher running, wait":"morpher not running, ignore"}`)
        //     if (processEventsPromise) {
        //       await processEventsPromise
        //       console.log("morpher done")
        //     }
        //     res()
        //   },1000)
        // })
      }
    }
    compiler.hooks.watchRun.tapPromise(
      'ViewsMorpher',
      awaitProcessEventsPromise
    )
  }

  let skipTimeout = null
  let processEventsPromise = null
  let queue = []
  function onEvent({ file, op }, skip) {
    console.log('entered event, file: ', file, 'op: ', op)

    if (!skip) {
      queue.push({ file: path.join(morpher.src, file), op })
    }

    // if morpher busy, try again in a bit
    clearTimeout(skipTimeout)
    skipTimeout = null
    if (processEventsPromise) {
      setTimeout(() => onEvent({}, true), 200)
      return
    }
    console.log('after enter, queue is', queue)
    processEvents()
  }

  async function processEvents() {
    // idle = false
    console.log('process events, queue is empty?', queue.length === 0)
    if (queue.length === 0) {
      console.log('skipping morpher', queue.length)
      // idle = true
      return
    }
    if (processEventsPromise) {
      console.log('this should never happen, promise is not null')
      return
    }

    console.log('on process, queue is', queue)

    let queueClone = [...queue]
    queue = []
    processEventsPromise = new Promise(async (response, reject) => {
      try {
        await processQueue({ queue: queueClone, morpher })
      } catch (e) {
        console.log('error')
      } finally {
        response()
        processEventsPromise = null
      }
    })

    // idle = true

    // if (compiler) {
    //   console.log('runnning compiler', 'idle is?', idle)
    //   compiler.run((err, stats) => {
    //     idle = true

    //     console.log(
    //       process.hrtime(),
    //       'webpack compiler finished running',
    //       'idle is?',
    //       idle
    //     )

    //     if (err) {
    //       console.error('compiler errors', err)
    //       return
    //     }

    //     console.log('compiler done', stats)
    //   })
    // } else {
    //   idle = true
    // }
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
          filesToProcess.filesView.add(file.replace('.logic.js', ''))
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
