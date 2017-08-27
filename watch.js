const { getViewNotFound, isViewNameRestricted, morph } = require('./lib.js')
const chalk = require('chalk')
const chokidar = require('chokidar')
const clean = require('./clean.js')
const flatten = require('flatten')
const fs = require('mz/fs')
const globule = require('globule')
const path = require('path')
const toCamelCase = require('to-camel-case')
const toPascalCase = require('to-pascal-case')
const uniq = require('array-uniq')

const isMorphedData = f => /\.data\.js$/.test(f)
const isMorphedView = f => /\.view\.js$/.test(f)

const isData = f => /\.view\.data$/.test(f)
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
  return new Promise((resolve, reject) => {
    let {
      as,
      compile,
      dataNotFound,
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

    if (!dataNotFound)
      dataNotFound = name => {
        const warning = `${src}/${name}.data doesn't exist but it is being used. Create the file!`
        verbose && console.log(chalk.magenta(`! ${warning}`))
        return getViewNotFound('data', name, warning)
      }

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
        const content = fs.readFileSync(f, 'utf-8')
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
        isMorphedData(f) ||
        (isJs(f) && !isJsComponent(f) && !isLogic(f)) ||
        (!shouldIncludeLogic && isLogic(f)) ||
        isDirectory(f)
      )
        return

      return fn(f, a)
    }

    const getImportFileName = (name, file) => {
      let f = views[name] || data[name]

      if (isView(f)) {
        const logicFile = logic[`${name}.view.logic`]
        if (logicFile) f = logicFile
      }

      const ret = relativise(file, f)

      return isJs(ret) ? ret : `${ret}.js`
    }

    const makeGetImport = (view, file) => {
      dependsOn[view] = []

      return name => {
        if (!dependsOn[view].includes(name)) {
          dependsOn[view].push(name)
        }
        // TODO track dependencies to make it easy to rebuild files as new ones get
        // added, eg logic is added, we need to rebuild upwards
        if (isData(name)) {
          return data[name]
            ? `import ${toCamelCase(name)} from '${getImportFileName(
                name,
                file
              )}'`
            : dataNotFound(name)
        } else {
          return views[name]
            ? `import ${name} from '${getImportFileName(name, file)}'`
            : viewNotFound(name)
        }
      }
    }

    const data = {}
    const dependsOn = {}
    const logic = {}
    const tests = {}
    const views = Object.assign({}, map)

    const instance = {
      data,
      dependsOn,
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
        maybeFakeJs(f, file, view)
        return
      }

      const fileIsData = isData(file)

      verbose && console.log(chalk.yellow('A'), view, chalk.dim(`-> ${f}`))

      let shouldMorph = isView(file) // || isFake(view)

      if (fileIsData) {
        data[view] = file
        shouldMorph = true
      } else if (isTests(file)) {
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

    const maybeFakeJs = (f, file, view) => {
      const fakeView = `${view}.view.fake`

      if (!(isJsComponent(f) && shouldIncludeFake && !views[view])) return false

      const fakeFile = path.join(path.dirname(f), fakeView)

      // TODO async
      if (fs.existsSync(fakeFile)) return true

      // TODO async
      fs.writeFileSync(
        fakeFile,
        `${view}Fake is Vertical
backgroundColor rgba(53,63,69,0.5)
width 100
height 100`
      )

      const finalFake = toViewPath(fakeFile)
      console.log(
        chalk.green('🐿 '),
        finalFake.view,
        chalk.dim(`-> ${finalFake.fakeFile}`)
      )
      return true
    }

    const maybeIsReady = () => {
      const isReady = viewsLeftToBeReady === 0

      if (isReady) return true

      if (viewsLeftToBeReady > 0) {
        viewsLeftToBeReady--

        if (viewsLeftToBeReady === 0) {
          resolve(instance)
        }
      }
    }

    const getPointsOfUseFor = view =>
      Object.keys(dependsOn).filter(dep => dependsOn[dep].includes(view))

    const getDependedUpon = view => {
      const dependedUpon = []
      const left = getPointsOfUseFor(view)

      while (left.length > 0) {
        const next = left.pop()

        if (!dependedUpon.includes(next)) {
          dependedUpon.push(next)
          getPointsOfUseFor(next).forEach(dep => left.push(dep))
        }
      }

      return dependedUpon
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
        const source = await fs.readFile(f, 'utf-8')

        const res = morph(source, {
          as: isData(f) ? 'data' : isTests(f) ? 'tests' : as,
          compile,
          inlineStyles,
          file: { raw: f, relative: file },
          name: view,
          getImport,
          pretty,
          tests: tests[`${view}.view.tests`],
          views,
        })

        const toMorph = {
          code: res.code,
          dependsOn: dependsOn[view],
          file: f,
          fonts: res.fonts,
          source,
          todos: res.todos,
          view,
        }

        if (maybeIsReady()) {
          if (toMorphQueue === null) {
            toMorphQueue = []
          }
          toMorphQueue.push(toMorph)

          if (!skipRemorph) {
            await remorphDependenciesFor(view)
            await Promise.all(toMorphQueue.map(onMorph))
            toMorphQueue = null
          }
        } else {
          await onMorph(toMorph)
        }

        verbose && console.log(chalk.green('M'), view)
      } catch (err) {
        verbose && console.error(chalk.red('M'), view, err)
      }
    })

    const remorphDependenciesFor = async viewRaw => {
      const view = viewRaw.split('.')[0]

      const dependedUpon = uniq(flatten(getDependedUpon(view)))

      await Promise.all(
        dependedUpon.map(dep => {
          return morphView(path.join(src, views[dep]), true)
        })
      )
    }

    const toViewPath = f => {
      const file = path.relative(src, f)
      const view =
        isData(file) || isTests(file)
          ? file
          : isLogic(file)
            ? file.replace(/\.js/, '').replace(/\//g, '')
            : toPascalCase(file.replace(/\.(view\.fake|js|view)/, ''))

      return {
        file: `./${file}`,
        view,
      }
    }

    const watcherOptions = {
      filter: f => !/node_modules/.test(f) && !isMorphedView(f),
    }
    const watcherPattern = [
      `${src}/**/*.data`,
      `${src}/**/*.js`,
      `${src}/**/*.view`,
      shouldIncludeLogic && `${src}/**/*.view.logic.js`,
      shouldIncludeTests && `${src}/**/*.view.tests`,
      shouldIncludeFake && `${src}/**/*.view.fake`,
    ].filter(Boolean)

    let viewsLeftToBeReady = null

    const viewsToMorph = globule
      .find(watcherPattern, watcherOptions)
      .map(addViewSkipMorph)
      .filter(Boolean)

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

      watcher.on('add', addView)
      watcher.on('change', f => morphView(f))
      watcher.on(
        'unlink',
        filter(f => {
          const { view } = toViewPath(f)
          if (isViewNameRestricted(view, as)) return

          verbose && console.log(chalk.blue('D'), view)

          if (isData(f)) {
            delete data[view]
          } else if (isTests(f)) {
            delete tests[view]
          } else if (isLogic(f)) {
            delete logic[view]
          } else {
            delete views[view]
          }

          if (typeof onRemove === 'function') {
            onRemove(view)
          }

          remorphDependenciesFor(view)

          delete dependsOn[view]
        })
      )
    }
  })
}
