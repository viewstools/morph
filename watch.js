const { getViewNotFound, isViewNameRestricted, morph } = require('./lib.js')
const chalk = require('chalk')
const clean = require('./clean.js')
const fs = require('fs')
const globule = require('globule')
const path = require('path')
const toCamelCase = require('to-camel-case')
const toPascalCase = require('to-pascal-case')
const watch = require('gaze')

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

const onMorphWriteFile = ({ file, code }) =>
  new Promise((resolve, reject) => {
    fs.writeFile(`${file}.js`, code, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })

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
        const content = fs.readFileSync(f, 'utf-8')
        is = /\/\/ @view/.test(content)
      } catch (err) {}

      return (jsComponents[f] = is)
    }

    const filter = fn => (f, a) => {
      if (
        isMorphedView(f) ||
        isMorphedData(f) ||
        (isJs(f) && !isJsComponent(f) && !isLogic(f)) ||
        (!shouldIncludeLogic && isLogic(f)) ||
        fs.statSync(f).isDirectory()
      )
        return

      return fn(f, a)
    }

    const getImportFileName = (name, file) => {
      let f = views[name] || data[name] // || fakes[name]

      if (isView(f)) {
        // || isFake(f)) {
        const logicFile = logic[`${name}.view.logic`]
        if (logicFile) f = logicFile

        // const fakeFile = fakes[name]
        // if (fakeFile) f = fakeFile
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
        // added
        if (isData(name)) {
          return data[name]
            ? `import ${toCamelCase(name)} from '${getImportFileName(
                name,
                file
              )}'`
            : dataNotFound(name)
        } else {
          return views[name] // || fakes[name]
            ? `import ${name} from '${getImportFileName(name, file)}'`
            : viewNotFound(name)
        }
      }
    }

    const data = {}
    const dependsOn = {}
    // const fakes = {}
    const logic = {}
    const tests = {}
    const views = Object.assign({}, map)

    const instance = {
      data,
      dependsOn,
      // fakes,
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
      } else {
        if (!maybeFakeJs(f, file, view)) {
          views[view] = file
        }
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

      if (fs.existsSync(fakeFile)) return true

      fs.writeFileSync(
        fakeFile,
        `${view}Fake is Vertical
backgroundColor rgba(53,63,69,0.5)
width 100
height 100`
      )

      const finalFake = toViewPath(fakeFile)
      fakes[finalFake.view] = finalFake.file
      console.log(
        chalk.green('🐿 '),
        finalFake.view,
        chalk.dim(`-> ${finalFake.fakeFile}`)
      )
      return true
    }

    const maybeIsReady = () => {
      if (viewsLeftToBeReady > 0) {
        viewsLeftToBeReady--

        if (viewsLeftToBeReady === 0) {
          resolve(instance)
        }
      }
    }

    const addViewSkipMorph = f => addView(f, true)

    const morphView = filter(f => {
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

      fs.readFile(f, 'utf-8', async (err, source) => {
        if (err) {
          return verbose && console.error(chalk.red('M'), view, err)
        }

        try {
          const code = morph(source, {
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

          await onMorph({
            code,
            dependsOn: dependsOn[view],
            file: f,
            source,
            view,
          })

          maybeIsReady()

          verbose && console.log(chalk.green('M'), view)
        } catch (err) {
          verbose && console.error(chalk.red('M'), view, err)
        }
      })
    })

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
      debounceDelay: 50,
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

    const viewsToMorph = globule
      .find(watcherPattern, watcherOptions)
      .map(addViewSkipMorph)
      .filter(Boolean)

    let viewsLeftToBeReady = viewsToMorph.length
    viewsToMorph.forEach(morphView)

    if (!once) {
      watch(watcherPattern, watcherOptions, (err, watcher) => {
        if (err) {
          verbose && console.error(err)
          return
        }

        instance.stop = () => watcher.close()

        watcher.on('error', () => {
          console.error('watcher error', args)
        })

        // TODO see how we can force a rebuild when a file gets added/deleted
        watcher.on('added', addView)
        watcher.on('changed', morphView)
        watcher.on(
          'deleted',
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
          })
        )
      })
    }
  })
}
