const { extname, relative } = require('path')
const { getViewNotFound, morph } = require('./lib.js')
const { readFile, readFileSync, writeFile } = require('fs')
const chalk = require('chalk')
const globule = require('globule')
const toCamelCase = require('to-camel-case')
const toPascalCase = require('to-pascal-case')
const watch = require('gaze')

const isMorphedData = f => /\.data\.js$/.test(f)
const isMorphedView = f => /\.view\.js$/.test(f)

const isData = f => extname(f) === '.data'
const isJs = f => extname(f) === '.js'
const isView = f => extname(f) === '.view'
const isTests = f => extname(f) === '.tests'

module.exports = options => {
  let {
    as,
    compile,
    dataNotFound,
    inlineStyles,
    map,
    shared,
    src,
    pretty,
    tests: shouldIncludeTests,
    viewNotFound,
  } = Object.assign(
    {
      as: 'react-dom',
      compile: false,
      map: {},
      pretty: true,
      src: process.cwd(),
    },
    options
  )

  if (!shared) shared = `views-blocks-${as}`
  if (!dataNotFound)
    dataNotFound = name => {
      const warning = `${src}/${name}.data doesn't exist but it is being used. Create the file!`
      console.log(chalk.magenta(`! ${warning}`))
      return getViewNotFound('data', name, warning)
    }

  if (!viewNotFound)
    viewNotFound = name => {
      const warning = `${src}/${name}.view doesn't exist but it is being used. Create the file!`
      console.log(chalk.magenta(`! ${warning}`))
      return getViewNotFound(as, name, warning)
    }

  const jsComponents = {}
  const isJsComponent = f => {
    if (jsComponents.hasOwnProperty(f)) return jsComponents[f]
    return (jsComponents[f] = /import React/.test(readFileSync(f, 'utf-8')))
  }

  const filter = fn => f => {
    if (isMorphedView(f) || isMorphedData(f) || (isJs(f) && !isJsComponent(f)))
      return

    fn(f)
  }

  const getImportFileName = name => {
    const f = views[name] || data[name]
    return isView(f) || isData(f) ? `${f}.js` : f
  }
  const getImport = name => {
    if (isData(name)) {
      return data[name]
        ? `import ${toCamelCase(name)} from '${getImportFileName(name)}'`
        : dataNotFound(name)
    } else {
      return views[name]
        ? `import ${name} from '${getImportFileName(name)}'`
        : viewNotFound(name)
    }
  }

  const views = map
  const data = {}
  const tests = {}

  const addView = filter(f => {
    const { file, view } = toViewPath(f)
    const fileIsData = isData(file)

    console.log(chalk.yellow('A'), view, chalk.dim(`-> ${f}`))

    let shouldMorph = isView(file)

    if (fileIsData) {
      data[view] = file
      shouldMorph = true
    } else if (isTests(file)) {
      tests[view] = file
      shouldMorph = true
    } else {
      views[view] = file
    }

    if (shouldMorph) morphView(f)
  })

  const morphView = filter(f => {
    const { file, view } = toViewPath(f)
    if (isJs(f)) return

    readFile(f, 'utf-8', (err, source) => {
      if (err) {
        return console.error(chalk.red('M'), view, err)
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
        })

        writeFile(`${f}.js`, code, err => {
          if (err) {
            return console.error(chalk.red('M'), view, err)
          }

          console.log(chalk.green('M'), view)
        })
      } catch (err) {
        return console.error(chalk.red('M'), view, err)
      }
    })
  })

  const toViewPath = f => {
    const file = relative(src, f)
    const view = isData(file) || isTests(file)
      ? file
      : toPascalCase(file.replace(/\.(view|js)/g, ''))

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
    shouldIncludeTests && `${src}/**/*.view.tests`,
  ].filter(Boolean)
  globule.find(watcherPattern, watcherOptions).forEach(addView)

  watch(watcherPattern, watcherOptions, (err, watcher) => {
    if (err) {
      console.error(err)
      return
    }

    // TODO see how we can force a rebuild when a file gets added/deleted
    watcher.on('added', addView)
    watcher.on('changed', morphView)
    watcher.on(
      'deleted',
      filter(f => {
        const { view } = toViewPath(f)
        console.log(chalk.blue('D'), view)

        if (isData(f)) {
          delete data[view]
        } else if (isTests(f)) {
          delete tests[view]
        } else {
          delete views[view]
        }
      })
    )
  })
}
