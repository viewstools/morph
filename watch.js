const { getViewNotFound, morph, pathToName, types } = require('./lib.js')
const { extname, relative } = require('path')
const { readFile, readFileSync, writeFile } = require('fs')
const chalk = require('chalk')
const globule = require('globule')
const toPascalCase = require('to-pascal-case')
const watch = require('gaze')

const { ACTION, TELEPORT } = types

const isJs = f => extname(f) === '.js'
const isMorphedView = f => /\.view\.js$/.test(f)
const isView = f => extname(f) === '.view'

module.exports = options => {
  let { as, compile, map, shared, src, pretty, viewNotFound } = Object.assign(
    {
      as: 'react-dom',
      compile: true,
      map: {},
      pretty: false,
      src: process.cwd(),
    },
    options
  )

  if (!shared) shared = `views-blocks-${as}`
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
    if (isMorphedView(f) || (isJs(f) && !isJsComponent(f))) return

    fn(f)
  }

  const getImportFileName = name => {
    const f = views[name]
    return isView(f) ? `${f}.js` : f
  }
  const getImport = name => {
    switch (name) {
      case ACTION:
      case TELEPORT:
        return `import { ${name} } from '${shared}'`
      default:
        return views[name]
          ? `import ${name} from '${getImportFileName(name)}'`
          : viewNotFound(name)
    }
  }

  const views = map

  const addView = filter(f => {
    const { file, view } = toViewPath(f)
    console.log(chalk.yellow('A'), view, chalk.dim(`-> ${f}`))
    views[view] = file

    if (isView(file)) morphView(f)
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
          as,
          compile,
          name: view,
          getImport,
          pretty,
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
    const view = toPascalCase(file.replace(/\.(view|js)/g, ''))

    return {
      file: `./${file}`,
      view,
    }
  }

  const watcherOptions = {
    filter: f => !/node_modules/.test(f) && !isMorphedView(f),
  }
  const watcherPattern = ['**/*.js', '**/*.view']
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

        delete views[view]
      })
    )
  })
}
