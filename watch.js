const { getViewNotFound, isViewNameRestricted, morph } = require('./lib.js')
const chalk = require('chalk')
const chokidar = require('chokidar')
const clean = require('./clean.js')
const flatten = require('flatten')
const fs = require('mz/fs')
const glob = require('fast-glob')
const path = require('path')
const toPascalCase = require('to-pascal-case')
const uniq = require('array-uniq')

const isMorphedView = f => /\.view\.js$/.test(f)

// const isFake = f => /\.view\.fake$/.test(f)
const isJs = f => path.extname(f) === '.js'
const isLogic = f => /\.view\.logic\.js$/.test(f)
const isTests = f => /\.view\.tests$/.test(f)
const isView = f => path.extname(f) === '.view' || /\.view\.fake$/.test(f)

const relativise = (from, to) => {
  const r = path.relative(from, to)
  return r.substr(r.startsWith('../..') ? 3 : 1)
}

const onMorphWriteFile = ({ file, code }) => fs.writeFile(`${file}.js`, code)

module.exports = options => {
  return new Promise(async (resolve, reject) => {
    let {
      as,
      compile,
      debug,
      fake: shouldIncludeFake,
      inlineStyles,
      map,
      logic: shouldIncludeLogic,
      once,
      onMorph,
      onRemove,
      pretty,
      src,
      tests: shouldIncludeTests,
      verbose,
      viewNotFound,
    } = Object.assign(
      {
        as: 'react-dom',
        compile: false,
        debug: false,
        fake: false,
        map: {},
        logic: true,
        pretty: true,
        src: process.cwd(),
        once: false,
        onMorph: onMorphWriteFile,
        verbose: true,
      },
      options
    )

    clean(src)

    if (!viewNotFound)
      viewNotFound = name => {
        const warning = `${src}/${name}.view doesn't exist but it is being used. Create the file!`
        verbose && console.log(chalk.magenta(`! ${warning}`))
        return getViewNotFound(as, name, warning)
      }

    const jsComponents = {}
    const isJsComponent = f => {
      if (jsComponents.hasOwnProperty(f)) return jsComponents[f]
      let is = false

      try {
        // TODO async
        const filePath = path.join(src, f)
        const content = fs.readFileSync(filePath, 'utf-8')
        is = /\/\/ @view/.test(content)
      } catch (err) {}

      return (jsComponents[f] = is)
    }

    const isDirectory = f => {
      try {
        // TODO async
        return fs.statSync(f).isDirectory()
      } catch (err) {
        return false
      }
    }

    const filter = fn => (f, a) => {
      if (
        isMorphedView(f) ||
        (isJs(f) && !isJsComponent(f) && !isLogic(f)) ||
        (!shouldIncludeLogic && isLogic(f)) ||
        isDirectory(f)
      )
        return

      return fn(f, a)
    }

    const getImportFileName = (name, file) => {
      let f = views[name]

      if (isView(f)) {
        const logicFile = logic[`${name}.view.logic`]
        if (logicFile) f = logicFile
      }

      const ret = relativise(file, f)

      return isJs(ret) ? ret.replace(/\.js$/, '') : `${ret}.js`
    }

    const makeGetImport = (view, file) => {
      dependsOn[view] = []

      return name => {
        if (!dependsOn[view].includes(name)) {
          dependsOn[view].push(name)
        }
        // TODO track dependencies to make it easy to rebuild files as new ones get
        // added, eg logic is added, we need to rebuild upwards

        return views[name]
          ? `import ${name} from '${getImportFileName(name, file)}'`
          : viewNotFound(name)
      }
    }

    const dependsOn = {}
    const responsibleFor = {}
    const logic = {}
    const tests = {}
    const views = Object.assign({}, map)

    const instance = {
      dependsOn,
      responsibleFor,
      logic,
      tests,
      views,
      stop() {},
    }

    const addView = filter((f, skipMorph = false) => {
      const { file, view } = toViewPath(f)

      if (isViewNameRestricted(view, as)) {
        verbose &&
          console.log(
            chalk.magenta('X'),
            view,
            chalk.dim(`-> ${f}`),
            'is a Views reserved name. To fix this, change its file name to something else.'
          )
        return
      }

      if (isJsComponent(f) && shouldIncludeFake) {
        return maybeFakeJs(f, file, view)
      }

      verbose && console.log(chalk.yellow('A'), view, chalk.dim(`-> ${f}`))

      let shouldMorph = isView(file) // || isFake(view)

      if (isTests(file)) {
        tests[view] = file
        shouldMorph = true
      } else if (isLogic(file)) {
        logic[view] = file

        if (viewsLeftToBeReady === 0) {
          remorphDependenciesFor(view)
        }
      } else {
        views[view] = file
      }

      if (shouldMorph) {
        if (skipMorph) {
          return f
        } else {
          morphView(f)
        }
      }
    })

    const makeResponsibleFor = () => {
      Object.keys(views).forEach(updateResponsibleFor)
    }

    const maybeFakeJs = (f, file, view) => {
      const fakeView = `${view}.view.fake`

      if (!(isJsComponent(f) && shouldIncludeFake && !views[view])) return

      const fakeFile = path.join(path.dirname(f), fakeView)

      // TODO async
      if (!fs.existsSync(fakeFile)) {
        // TODO async
        fs.writeFileSync(
          fakeFile,
          `${view}Fake is Vertical
backgroundColor rgba(53,63,69,0.5)
width 100
height 100`
        )

        // const finalFake = toViewPath(fakeFile)
      }
      console.log(chalk.green('🐿 '), view, chalk.dim(`-> ${fakeFile}`))

      views[view] = fakeFile
      return fakeFile
    }

    const maybeIsReady = () => {
      const isReady = viewsLeftToBeReady === 0

      if (isReady) return true

      if (viewsLeftToBeReady > 0) {
        viewsLeftToBeReady--

        if (viewsLeftToBeReady === 0) {
          makeResponsibleFor()

          resolve(instance)
        }
      }
    }

    const getPointsOfUseFor = view =>
      Object.keys(dependsOn).filter(dep => dependsOn[dep].includes(view))

    const updateResponsibleFor = viewRaw => {
      const view = viewRaw.split('.')[0]
      const list = []
      const left = getPointsOfUseFor(view)

      while (left.length > 0) {
        const next = left.pop()

        if (!list.includes(next)) {
          list.push(next)
          getPointsOfUseFor(next).forEach(dep => left.push(dep))
        }
      }

      responsibleFor[view] = uniq(flatten(list))

      return responsibleFor[view]
    }

    const addViewSkipMorph = f => addView(f, true)

    let toMorphQueue = null

    const morphView = filter(async (f, skipRemorph) => {
      const { file, view } = toViewPath(f)
      if (isViewNameRestricted(view, as)) {
        verbose &&
          console.log(
            chalk.magenta('X'),
            view,
            chalk.dim(`-> ${f}`),
            'is a Views reserved name. To fix this, change its file name to something else.'
          )
        return
      }

      if (isJs(f)) return

      const getImport = makeGetImport(view, file)

      try {
        const rawFile = path.join(src, f)
        const source = await fs.readFile(rawFile, 'utf-8')

        const res = morph(source, {
          as: isTests(f) ? 'tests' : as,
          compile,
          debug,
          inlineStyles,
          file: { raw: rawFile, relative: file },
          name: view,
          getImport,
          pretty,
          tests: tests[`${view}.view.tests`],
          views,
        })

        const toMorph = {
          code: res.code,
          dependsOn: dependsOn[view],
          // responsibleFor: responsibleFor[view],
          file: rawFile,
          fonts: res.fonts,
          source,
          tests: res.tests,
          todos: res.todos,
          view,
        }

        if (maybeIsReady()) {
          // TODO revisit effect of rawView vs view here
          updateResponsibleFor(view)
          toMorph.responsibleFor = responsibleFor[view]

          if (toMorphQueue === null) {
            toMorphQueue = []
          }
          toMorphQueue.push(toMorph)

          if (!skipRemorph) {
            await remorphDependenciesFor(view)
            await Promise.all(toMorphQueue.map(onMorph))
            toMorphQueue = null
          }

          if (isTests(f)) {
            const viewForTest = view.replace('.view.tests', '')
            if (views[viewForTest]) {
              morphView(path.join(src, views[viewForTest]))
            }
          }
        } else {
          await onMorph(toMorph)
        }

        verbose && console.log(chalk.green('M'), view)
      } catch (err) {
        verbose &&
          console.error(
            chalk.red('M'),
            view,
            typeof err.toString === 'function' ? err.toString() : err
          )
      }
    })

    const remorphDependenciesFor = async viewRaw => {
      const view = viewRaw.split('.')[0]

      await Promise.all(
        responsibleFor[view].map(dep => {
          return morphView(path.join(src, views[dep]), true)
        })
      )
    }

    const toViewPath = f => {
      const file = f.replace(/(\.ios|\.android|\.web)/, '')

      let view = path.basename(file)
      if (!isTests(file)) {
        if (isLogic(file)) {
          view = view.replace(/\.js/, '')
        } else {
          view = toPascalCase(view.replace(/\.(view\.fake|js|view)/, ''))
        }
      }

      return {
        file: `./${file}`,
        view,
      }
    }

    const watcherOptions = {
      // filter: f => !/node_modules/.test(f) && !isMorphedView(f),
      cwd: src,
      ignore: ['**/node_modules/**', '**/*.view.js'],
    }
    const watcherPattern = [
      `**/*.js`,
      `**/*.view`,
      shouldIncludeLogic && `**/*.view.logic.js`,
      shouldIncludeTests && `**/*.view.tests`,
      shouldIncludeFake && `**/*.view.fake`,
    ].filter(Boolean)

    let viewsLeftToBeReady = null

    const listToMorph = await glob(watcherPattern, watcherOptions)
    const viewsToMorph = listToMorph.map(addViewSkipMorph).filter(Boolean)

    viewsLeftToBeReady = viewsToMorph.length
    viewsToMorph.forEach(morphView)

    if (!once) {
      const watcher = chokidar.watch(watcherPattern, {
        ignored: /(node_modules|\.view.js)/,
        ignoreInitial: true,
      })

      if (verbose) {
        watcher.on('error', console.error.bind(console))
      }

      instance.stop = () => watcher.close()

      watcher.on('add', f => addView(f))
      watcher.on('change', f => morphView(f))
      watcher.on(
        'unlink',
        filter(f => {
          const { view } = toViewPath(f)
          if (isViewNameRestricted(view, as)) return

          verbose && console.log(chalk.blue('D'), view)

          if (isTests(f)) {
            delete tests[view]

            const viewForTest = view.replace('.view.tests', '')
            if (views[viewForTest]) {
              morphView(path.join(src, views[viewForTest]))
            }
          } else if (isLogic(f)) {
            delete logic[view]
          } else {
            delete views[view]
          }

          if (typeof onRemove === 'function') {
            onRemove(view)
          }

          updateResponsibleFor(view)

          remorphDependenciesFor(view)

          delete dependsOn[view]
        })
      )
    }
  })
}
