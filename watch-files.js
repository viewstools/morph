import { promises as fs } from 'fs'
import { getFontId } from './fonts.js'
import chalk from 'chalk'
import chokidar from 'chokidar'
import getFirstLine from 'firstline'
import getPointsOfUse from './get-points-of-use.js'
import getViewIdFromFile from './get-view-id-from-file.js'
import isViewCustom from './is-view-custom.js'
import path from 'path'

function watchFiles({ onAdd, onChange, onRemove, src, pattern, ignore = [] }) {
  let watcher = chokidar.watch(pattern, {
    cwd: src,
    ignore: ['**/node_modules/**', '**/*.view.js', ...ignore],
    ignoreInitial: true,
  })

  let withAbsolutePath = fn => file => fn(path.join(src, file))

  if (typeof onAdd === 'function') {
    watcher.on('add', withAbsolutePath(onAdd))
  }
  if (typeof onChange === 'function') {
    watcher.on('change', withAbsolutePath(onChange))
  }
  if (typeof onRemove === 'function') {
    watcher.on('unlink', withAbsolutePath(onRemove))
  }

  return watcher
}

export function watchFilesView({
  filesViewLogic,
  processFiles,
  src,
  verbose,
  viewsById,
  viewsToFiles,
}) {
  let makeOnAddOrChange = isAdd => async file => {
    await processFiles({
      filesView: new Set([file]),
      filesViewLogic,
    })
    verbose &&
      console.log(
        isAdd ? `${chalk.yellow('A')} ${chalk.green('M')}` : chalk.green('M'),
        getViewIdFromFile(file),
        chalk.dim(`-> ${file}`)
      )
  }

  return watchFiles({
    onAdd: makeOnAddOrChange(true),
    onChange: makeOnAddOrChange(false),
    onRemove: async file => {
      let view = viewsToFiles.get(file)
      if (!view) return

      verbose &&
        console.log(chalk.magenta('X'), view.id, chalk.dim(`-> ${file}`))

      let { filesView, viewsId } = getPointsOfUse({ view, viewsToFiles })
      filesView.delete(view.file)

      try {
        await fs.unlink(`${view.file}.js`)
      } catch (error) {
        console.error(error)
      }
      viewsById.delete(view.id)
      viewsToFiles.delete(view.file)

      await processFiles({
        filesView,
        filesViewLogic,
      })

      if (verbose && viewsId.size > 0) {
        console.log(chalk.green('M'), [...viewsId].join(', '))
      }
    },
    src,
    pattern: ['**/*.view'],
  })
}

export function watchFilesViewLogic({
  filesViewLogic,
  processFiles,
  src,
  verbose,
  viewsToFiles,
}) {
  return watchFiles({
    onAdd: async file => {
      filesViewLogic.add(file)

      let id = getViewIdFromFile(file)
      let view = viewsToFiles.get(file.replace('.view.logic.js', '.view'))
      if (!view) return

      verbose &&
        console.log(
          chalk.yellow('A'),
          chalk.dim('logic'),
          id,
          chalk.dim(`-> ${file}`)
        )

      let { filesView, viewsId } = getPointsOfUse({ view, viewsToFiles })

      await processFiles({
        filesView,
        filesViewLogic,
      })
      verbose && console.log(chalk.green('M'), [...viewsId].join(', '))
    },
    onRemove: async file => {
      filesViewLogic.delete(file)

      let id = getViewIdFromFile(file)

      let view = viewsToFiles.get(file.replace('.view.logic.js', '.view'))
      if (view.logic !== file) return

      verbose &&
        console.log(
          chalk.yellow('X'),
          chalk.dim('logic'),
          id,
          chalk.dim(`-> ${file}`)
        )

      let { filesView, viewsId } = getPointsOfUse({ view, viewsToFiles })

      await processFiles({
        filesView,
        filesViewLogic,
      })
      verbose && console.log(chalk.green('M'), [...viewsId].join(', '))
    },
    src,
    pattern: ['**/*.view.logic.js'],
  })
}

let filterViewCustom = fn => async file => {
  try {
    let firstLine = await getFirstLine(file)
    if (isViewCustom(firstLine)) {
      fn(file)
    }
  } catch (error) {}
}

export function watchFilesViewCustom({
  processFiles,
  src,
  verbose,
  viewsById,
  viewsToFiles,
}) {
  let makeOnAddOrChange = isAdd => async file => {
    await processFiles({ filesViewCustom: new Set([file]) })
    verbose &&
      console.log(
        isAdd ? `${chalk.yellow('A')} ${chalk.green('M')}` : chalk.green('M'),
        chalk.dim('custom'),
        getViewIdFromFile(file),
        chalk.dim(`-> ${file}`)
      )
  }

  return watchFiles({
    onAdd: filterViewCustom(makeOnAddOrChange(true)),
    onChange: filterViewCustom(makeOnAddOrChange(false)),
    onRemove: async file => {
      let view = viewsToFiles.get(file)
      if (!view) return

      verbose &&
        console.log(
          chalk.magenta('X'),
          chalk.dim('custom'),
          view.id,
          chalk.dim(`-> ${file}`)
        )

      let { filesView, viewsId } = getPointsOfUse({ view, viewsToFiles })
      filesView.delete(view.file)

      viewsById.delete(view.id)
      viewsToFiles.delete(view.file)

      await processFiles({ filesView })

      if (verbose && viewsId.size > 0) {
        console.log(chalk.green('M'), [...viewsId].join(', '))
      }
    },
    src,
    pattern: ['**/*.js'],
    ignore: ['**/*.view.logic.js'],
  })
}

export function watchFilesFontCustom({
  customFonts,
  filesViewLogic,
  processFiles,
  src,
  verbose,
  viewsToFiles,
}) {
  function getFiles() {
    let filesView = new Set()
    let filesViewCustom = new Set()
    for (let view of viewsToFiles.values()) {
      if (view.custom) {
        filesViewCustom.add(view.file)
      } else {
        filesView.add(view.file)
      }
    }
    return { filesView, filesViewCustom, filesViewLogic }
  }

  return watchFiles({
    onAdd: async file => {
      await processFiles({
        ...getFiles(),
        filesFontCustom: new Set([file]),
      })

      verbose &&
        console.log(
          chalk.yellow('A'),
          chalk.dim('custom font'),
          getFontId(file),
          chalk.dim(`-> ${file}`)
        )
    },
    onRemove: async file => {
      let id = getFontId(file)
      let font = customFonts.get(id)
      font.delete(file)

      if (font.size === 0) {
        customFonts.delete(id)
      }

      await processFiles(getFiles())

      verbose &&
        console.log(
          chalk.magenta('X'),
          chalk.dim('custom font'),
          id,
          chalk.dim(`-> ${file}`)
        )
    },
    src,
    pattern: [
      '**/Fonts/*.eot',
      '**/Fonts/*.otf',
      '**/Fonts/*.ttf',
      '**/Fonts/*.svg',
      '**/Fonts/*.woff',
      '**/Fonts/*.woff2',
    ],
  })
}
