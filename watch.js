const {
  getViewNotFound,
  isViewNameRestricted,
  morph,
  morphFont,
} = require('./lib.js')
const chalk = require('chalk')
const chokidar = require('chokidar')
const clean = require('./clean.js')
const ensureBaseCss = require('./ensure-base-css.js')
const flatten = require('flatten')
const fs = require('mz/fs')
const glob = require('fast-glob')
const morphInlineSvg = require('./morph/inline-svg.js')
const path = require('path')
const toPascalCase = require('to-pascal-case')
const uniq = require('array-uniq')

const FONT_TYPES = {
  '.otf': 'opentype',
  '.ttf': 'truetype',
  '.woff': 'woff',
  '.woff2': 'woff2',
}

const isMorphedView = f => /\.view\.js$/.test(f)

const isJs = f => path.extname(f) === '.js'
const isLogic = f => /\.view\.logic\.js$/.test(f)
const isView = f => path.extname(f) === '.view' || /\.view\.fake$/.test(f)
const isFont = f => Object.keys(FONT_TYPES).includes(path.extname(f))

const getFontFileId = file => path.basename(file).split('.')[0]

const relativise = (from, to) => {
  const r = path.relative(from, to)
  return r.substr(r.startsWith('../..') ? 3 : 1)
}

const onMorphWriteFile = ({ as, file, code }) =>
  fs.writeFile(`${file}${as === 'e2e' ? '.page.js' : '.js'}`, code)

module.exports = options => {
  return new Promise(async (resolve, reject) => {
    let {
      as,
      clean: shouldClean,
      compile,
      debug,
      enableAnimated,
      fake: shouldIncludeFake,
      isBundlingBaseCss,
      logic: shouldIncludeLogic,
      map,
      onMorph,
      onRemove,
      once,
      pretty,
      src,
      verbose,
      viewNotFound,
    } = Object.assign(
      {
        as: 'react-dom',
        clean: true,
        compile: false,
        debug: false,
        enableAnimated: true,
        fake: false,
        isBundlingBaseCss: false,
        logic: true,
        map: {},
        onMorph: onMorphWriteFile,
        once: false,
        pretty: true,
        src: process.cwd(),
        verbose: true,
      },
      options
    )

    if (shouldClean) {
      clean(src)
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
        isDirectory(f) ||
        isFont(f)
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

    const addFont = file => {
      const id = getFontFileId(file)

      if (instance.customFonts.some(font => font.id === id)) return

      instance.customFonts.push({
        file,
        relativeFile: file.replace('Fonts/', './'),
        id: getFontFileId(file),
        type: FONT_TYPES[path.extname(file)],
      })
    }
    const removeFont = file => {
      const id = getFontFileId(file)
      instance.customFonts = instance.customFonts.filter(font => font.id !== id)
    }

    const fonts = {}

    const makeGetFont = (view, file) => {
      return font => {
        if (!fonts[font.id]) {
          fonts[font.id] = `Fonts/${font.id}.js`

          fs.writeFileSync(
            path.join(src, fonts[font.id]),
            morphFont({ as, font, files: instance.customFonts })
          )
        }

        return relativise(file, fonts[font.id])
      }
    }

    const makeGetImport = (view, file) => {
      dependsOn[view] = []

      return name => {
        if (name === 'ViewsBaseCss') {
          return isBundlingBaseCss
            ? `import '${relativise(file, instance.baseCss)}'`
            : ''
        }

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
    const views = Object.assign({}, map)

    const instance = {
      customFonts: [],
      dependsOn,
      responsibleFor,
      logic,
      views,
      stop() {},
    }

    if (as === 'react-dom' && isBundlingBaseCss) {
      instance.baseCss = 'ViewsBaseCss.js'
      ensureBaseCss(path.join(src, instance.baseCss))
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

      if (views[view]) {
        console.log(
          chalk.magenta('X'),
          chalk.dim(`-> ${f}`),
          `This view will not be morphed as a view with the name ${view} already exists. If you did intend to morph this view please give it a unique name.`
        )
        return
      }

      if (isJsComponent(f) && shouldIncludeFake) {
        return maybeFakeJs(f, file, view)
      }

      verbose && console.log(chalk.yellow('A'), view, chalk.dim(`-> ${f}`))

      let shouldMorph = isView(file)

      if (isLogic(file)) {
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
      if (fs.existsSync(path.join(src, fakeFile))) return

      // TODO async
      fs.writeFileSync(
        path.join(src, fakeFile),
        `${view}Fake Vertical
backgroundColor rgba(53,63,69,0.5)
width 50
height 50`
      )
      console.log(chalk.green('🐿 '), view, chalk.dim(`-> ${fakeFile}`))

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
      if (as === 'e2e') return

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

      const getFont = makeGetFont(view, file)
      const getImport = makeGetImport(view, file)
      let calledMaybeIsReady = false

      try {
        const rawFile = path.join(src, f)
        const source = await fs.readFile(rawFile, 'utf-8')

        const res = morph(source, {
          as,
          compile,
          debug,
          enableAnimated,
          file: { raw: rawFile, relative: file },
          name: view,
          getFont,
          getImport,
          pretty,
          views,
        })

        const toMorph = {
          as,
          code: res.code,
          dependsOn: dependsOn[view],
          // responsibleFor: responsibleFor[view],
          file: rawFile,
          fonts: res.fonts,
          props: res.props,
          source,
          view,
        }

        if (maybeIsReady()) {
          calledMaybeIsReady = true
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
        } else {
          await onMorph(toMorph)
        }

        if (Array.isArray(res.svgs)) {
          await Promise.all(
            res.svgs.map(async svg => {
              const svgFile = path.resolve(rawFile, '..', svg.source)

              try {
                const inlined = await morphInlineSvg(svgFile)

                // TODO revisit as most of the options don't matter here
                const res = morph(inlined, {
                  as,
                  compile,
                  debug,
                  enableAnimated,
                  file: { raw: rawFile, relative: file },
                  name: svg.view,
                  getImport,
                  pretty,
                  views,
                })

                await onMorph({
                  as,
                  code: res.code,
                  isInlineSvg: true,
                  file: path.resolve(rawFile, '..', `${svg.view}.view`),
                  view,
                })
              } catch (error) {
                console.error(
                  chalk.magenta('M'),
                  `${view}. Can't morph inline ${svgFile}`
                )
              }
            })
          )
        }

        verbose && console.log(chalk.green('M'), view)
      } catch (error) {
        verbose && console.error(chalk.red('M'), view, error)

        if (!calledMaybeIsReady) {
          maybeIsReady()
        }
      }
    })

    const remorphDependenciesFor = async viewRaw => {
      const view = viewRaw.split('.')[0]

      await Promise.all(
        responsibleFor[view].map(dep => {
          return morphView(views[dep], true)
        })
      )
    }

    const toViewPath = f => {
      const file = f.replace(/(\.ios|\.android|\.web)/, '')

      let view = path.basename(file)
      if (isLogic(file)) {
        view = view.replace(/\.js/, '')
      } else {
        view = toPascalCase(view.replace(/\.(view\.fake|js|view)/, ''))
      }

      return {
        file: `./${file}`,
        view,
      }
    }

    const removeView = filter(f => {
      const { view } = toViewPath(f)
      if (isViewNameRestricted(view, as)) return

      verbose && console.log(chalk.blue('D'), view)

      if (isLogic(f)) {
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

    const watcherOptions = {
      bashNative: ['linux'],
      cwd: src,
      ignore: ['**/node_modules/**', '**/*.view.js'],
    }
    const watcherPattern = [
      `**/*.js`,
      `**/*.view`,
      shouldIncludeLogic && `**/*.view.logic.js`,
      shouldIncludeFake && `**/*.view.fake`,
      // fonts,
      'Fonts/*.otf',
      'Fonts/*.ttf',
      'Fonts/*.woff',
      'Fonts/*.woff2',
    ].filter(Boolean)

    let viewsLeftToBeReady = null

    const listToMorph = await glob(watcherPattern, watcherOptions)
    const viewsToMorph = listToMorph.map(addViewSkipMorph).filter(Boolean)

    viewsLeftToBeReady = viewsToMorph.length
    viewsToMorph.forEach(morphView)

    const fontsDirectory = path.join(src, 'Fonts')
    if (!await fs.exists(fontsDirectory)) {
      await fs.mkdir(fontsDirectory)
    }
    const customFonts = await glob(
      [
        // fonts,
        'Fonts/*.otf',
        'Fonts/*.ttf',
        'Fonts/*.woff',
        'Fonts/*.woff2',
      ],
      watcherOptions
    )

    customFonts.forEach(addFont)

    if (!once) {
      const watcher = chokidar.watch(watcherPattern, {
        cwd: src,
        ignored: /(node_modules|\.view.js)/,
        ignoreInitial: true,
      })

      if (verbose) {
        watcher.on('error', console.error.bind(console))
      }

      instance.stop = () => watcher.close()

      watcher.on('add', f => {
        if (isFont(f)) {
          addFont(f)
        } else {
          addView(f)
        }
      })
      watcher.on('change', f => {
        morphView(f)
      })
      watcher.on('unlink', f => {
        if (isFont(f)) {
          removeFont(f)
        } else {
          removeView(f)
        }
      })
    }
  })
}
