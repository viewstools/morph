const { exec } = require('child_process')
const {
  getViewNotFound,
  isViewNameRestricted,
  morph,
  morphFont,
  parse,
} = require('./lib.js')
const chalk = require('chalk')
const chokidar = require('chokidar')
const clean = require('./clean.js')
const debounce = require('debounce')
const ensureBaseCss = require('./ensure-base-css.js')
const ensureLocalContainer = require('./ensure-local-container.js')
const ensureTrackContext = require('./ensure-track-context.js')
const getLatestVersion = require('latest-version')
const flatten = require('flatten')
const fs = require('mz/fs')
const glob = require('fast-glob')
const hasYarn = require('has-yarn')
const morphInlineSvg = require('./morph/inline-svg.js')
const path = require('path')
const toPascalCase = require('to-pascal-case')
const uniq = require('array-uniq')
const readPkgUp = require('read-pkg-up')

const FONT_TYPES = {
  '.otf': 'opentype',
  '.eot': 'eot',
  '.svg': 'svg',
  '.ttf': 'truetype',
  '.woff': 'woff',
  '.woff2': 'woff2',
}

const isMorphedView = f => /\.view\.js$/.test(f)

const isJs = f => path.extname(f) === '.js'
const isLogic = f => /\.view\.logic\.js$/.test(f)
const isView = f => path.extname(f) === '.view'
const isFont = f => Object.keys(FONT_TYPES).includes(path.extname(f))

const getFontFileId = file => path.basename(file).split('.')[0]

const relativise = (from, to) => {
  const r = path.relative(from, to).replace(/\\/g, '/')
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
      enableAnimated,
      isBundlingBaseCss,
      local,
      logic: shouldIncludeLogic,
      map,
      onMorph,
      onRemove,
      once,
      pretty,
      src,
      track,
      verbose,
      viewNotFound,
      warnOfDefaultValue,
    } = Object.assign(
      {
        as: 'react-dom',
        clean: true,
        compile: false,
        enableAnimated: true,
        isBundlingBaseCss: false,
        local: 'en',
        logic: true,
        map: {},
        onMorph: onMorphWriteFile,
        once: false,
        pretty: true,
        src: process.cwd(),
        track: true,
        verbose: true,
        warnOfDefaultValue: false,
      },
      options
    )

    if (shouldClean) {
      clean(src)
    }

    const shouldDisplayWarning = warning => {
      if (!verbose) return false
      return /default value/.test(warning.type) ? warnOfDefaultValue : true
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

    const filter = fn => (f, a, b) => {
      if (
        isMorphedView(f, a, b) ||
        (isJs(f) && !isJsComponent(f) && !isLogic(f)) ||
        (!shouldIncludeLogic && isLogic(f)) ||
        isDirectory(f) ||
        isFont(f)
      )
        return

      return fn(f, a, b)
    }

    const getImportFileName = (name, file) => {
      let f = views[name]

      if (!f) {
        throw new Error(
          `${chalk.magenta(
            name
          )} does not exist, you are trying to use it in ${chalk.magenta(
            file
          )}. There is either a spelling mistake or the view does not exist and needs to be created.`
        )
      }

      if (isView(f)) {
        const logicFile = logic[`${name}.view.logic`]
        if (logicFile) f = logicFile
      }

      const ret = relativise(file, f)

      return isJs(ret) ? ret.replace(/\.js$/, '') : `${ret}.js`
    }

    const addFont = file => {
      const id = getFontFileId(file)
      const type = FONT_TYPES[path.extname(file)]

      if (
        instance.customFonts.some(font => font.id === id && font.type === type)
      )
        return

      instance.customFonts.push({
        file,
        relativeFile: file.replace('Fonts/', './'),
        id: getFontFileId(file),
        type,
      })
    }
    const removeFont = file => {
      const id = getFontFileId(file)
      instance.customFonts = instance.customFonts.filter(font => font.id !== id)
    }

    const fonts = {}

    const makeGetDomFont = (view, file) => {
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

    const makeGetNativeFonts = view => {
      return fonts => {
        // TODO revisit, it's overwriting the fonts with an empty object, so
        // I'll disable it for now until we have more time to look into it.
        // fs.writeFileSync(
        //   path.join(src, 'fonts.js'),
        //   morphFont({ as, fonts, files: instance.customFonts })
        // )
      }
    }

    const makeGetImport = (view, file) => {
      dependsOn[view] = []

      return (name, isLazy) => {
        // Column is imported from react-virtualized
        if (name === 'Column') return
        if (name === 'ViewsBaseCss') {
          return isBundlingBaseCss
            ? `import '${relativise(file, instance.baseCss)}'`
            : ''
        }

        if (name === 'LocalContainer') {
          return `import LocalContainer from '${relativise(
            file,
            instance.localContainer
          )}'`
        }

        if (name === 'TrackContext') {
          return `import { TrackContext } from '${relativise(
            file,
            instance.trackContext
          )}'`
        }

        if (!dependsOn[view].includes(name)) {
          dependsOn[view].push(name)
        }
        // TODO track dependencies to make it easy to rebuild files as new ones get
        // added, eg logic is added, we need to rebuild upwards

        const importPath = getImportFileName(name, file)

        return views[name]
          ? isLazy
            ? `let ${name} = React.lazy(() => import('${importPath}'))`
            : `import ${name} from '${importPath}'`
          : viewNotFound(name)
      }
    }

    const dependsOn = {}
    const responsibleFor = {}
    const logic = {}
    const views = Object.assign({}, map)
    const viewsSources = {}
    const viewsParsed = {}

    const instance = {
      customFonts: [],
      externalDependencies: new Set(),
      dependsOn,
      responsibleFor,
      logic,
      views,
      stop() {},
    }

    let maybeUpdateExternalDependencies = debounce(async function() {
      let pkg = await readPkgUp(src)

      if (!pkg.pkg) return

      if (!pkg.pkg.dependencies) {
        pkg.pkg.dependencies = {}
      }

      let cwd = path.dirname(pkg.path)
      let shouldUpdate = false

      for (let dep of instance.externalDependencies) {
        if (!(dep in pkg.pkg.dependencies)) {
          let version = await getLatestVersion(dep)
          pkg.pkg.dependencies[dep] = `^${version}`

          console.log(`⚙️  installing Views dependency ${dep} v${version}`)
          shouldUpdate = true
        }
      }

      if (shouldUpdate) {
        await fs.writeFile(pkg.path, JSON.stringify(pkg.pkg, null, 2))
        exec(hasYarn(cwd) ? 'yarn' : 'npm install')
      }
    }, 100)

    if (as === 'react-dom' && isBundlingBaseCss) {
      instance.baseCss = 'ViewsBaseCss.js'
      ensureBaseCss(path.join(src, instance.baseCss))
    }

    const maybeUpdateLocal = supported => {
      if (local) {
        if (supported) {
          supported.forEach(lang => {
            if (!instance.localSupported.includes(lang)) {
              instance.localSupported.push(lang)
            }
          })
        }

        if (instance.localSupported.length > 1) {
          ensureLocalContainer({
            as,
            file: path.join(src, instance.localContainer),
            fileGetInitialLanguage: path.join(
              src,
              instance.localContainerGetInitialLanguage
            ),
            supported: instance.localSupported,
          })
        }
      }
    }

    if (local) {
      instance.localContainer = 'LocalContainer.js'
      instance.localContainerGetInitialLanguage = 'get-initial-language.js'
      instance.localSupported = [local]

      maybeUpdateLocal()
    }

    if (track) {
      instance.trackContext = 'TrackContext.js'

      ensureTrackContext({
        file: path.join(src, instance.trackContext),
      })
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

    const getViewSource = async f => {
      const { view } = toViewPath(f)

      try {
        const rawFile = path.join(src, f)
        const source = await fs.readFile(rawFile, 'utf-8')
        const parsed = parse({ source })
        viewsSources[view] = source
        viewsParsed[view] = parsed

        const warnings = parsed.warnings.filter(shouldDisplayWarning)

        if (warnings.length > 0) {
          console.error(
            chalk.red(view),
            chalk.dim(path.resolve(src, views[view]))
          )
          warnings.forEach(warning => {
            console.error(
              `  ${chalk.blue(warning.type)} ${chalk.yellow(
                `line ${warning.loc.start.line}`
              )} ${warning.line}`
            )
          })
        }

        maybeUpdateLocal(parsed.locals)
      } catch (error) {
        verbose && console.error(chalk.red('M'), view, error)
      }
    }

    let toMorphQueue = null
    const morphView = filter(async (f, skipRemorph, skipSource) => {
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

      const getFont =
        as === 'react-native'
          ? makeGetNativeFonts(view)
          : makeGetDomFont(view, file)
      const getImport = makeGetImport(view, file)
      let calledMaybeIsReady = false

      try {
        const rawFile = path.join(src, f)
        if (!skipSource) {
          await getViewSource(f)
        }

        const res = morph({
          as,
          compile,
          enableAnimated,
          file: { raw: rawFile, relative: file },
          name: view,
          getFont,
          getImport,
          localSupported: instance.localSupported,
          pretty,
          track,
          views: viewsParsed,
        })

        for (let dep of res.dependencies) {
          instance.externalDependencies.add(dep)
        }

        const toMorph = {
          as,
          code: res.code,
          dependsOn: dependsOn[view],
          // responsibleFor: responsibleFor[view],
          file: rawFile,
          fonts: res.fonts,
          slots: res.slots,
          source: viewsSources[view],
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

        maybeUpdateExternalDependencies()

        if (Array.isArray(res.svgs)) {
          await Promise.all(
            res.svgs.map(async svg => {
              const svgFile = path.resolve(rawFile, '..', svg.source)

              try {
                const inlined = await morphInlineSvg(svgFile)

                // TODO revisit as most of the options don't matter here
                const res = morph({
                  as,
                  compile,
                  enableAnimated,
                  file: { raw: rawFile, relative: file },
                  name: svg.view,
                  getImport,
                  pretty,
                  track,
                  views: {
                    [svg.view]: inlined,
                  },
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
        verbose && console.error(chalk.red('M'), view, error.codeFrame || error)

        if (!calledMaybeIsReady) {
          maybeIsReady()
        }
      }
    })

    const remorphDependenciesFor = async viewRaw => {
      const view = viewRaw.split('.')[0]

      await Promise.all(
        responsibleFor[view].map(dep => morphView(views[dep], true))
      )

      if (Array.isArray(toMorphQueue)) {
        await Promise.all(toMorphQueue.map(onMorph))
      }
    }

    const toViewPath = f => {
      const file = f.replace(/(\.ios|\.android|\.web)/, '')

      let view = path.basename(file)
      if (isLogic(file)) {
        view = view.replace(/\.js/, '')
      } else {
        view = toPascalCase(view.replace(/\.(js|view)/, ''))
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
        delete viewsSources[view]
        delete viewsParsed[view]
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
      // fonts,
      'Fonts/*.eot',
      'Fonts/*.otf',
      'Fonts/*.ttf',
      'Fonts/*.svg',
      'Fonts/*.woff',
      'Fonts/*.woff2',
    ].filter(Boolean)

    const fontsDirectory = path.join(src, 'Fonts')
    if (!(await fs.exists(fontsDirectory))) {
      await fs.mkdir(fontsDirectory)
    }
    const customFonts = await glob(
      [
        // fonts,
        'Fonts/*.eot',
        'Fonts/*.otf',
        'Fonts/*.ttf',
        'Fonts/*.svg',
        'Fonts/*.woff',
        'Fonts/*.woff2',
      ],
      watcherOptions
    )
    customFonts.forEach(addFont)

    console.log(
      'Custom fonts:\n',
      instance.customFonts.map(f => f.file).join(',\n'),
      '\n'
    )

    let viewsLeftToBeReady = null

    const listToMorph = await glob(watcherPattern, watcherOptions)
    const viewsToMorph = listToMorph.map(addViewSkipMorph).filter(Boolean)

    await Promise.all(viewsToMorph.map(getViewSource))

    viewsLeftToBeReady = viewsToMorph.length
    if (viewsLeftToBeReady === 0) {
      resolve(instance)
    } else {
      viewsToMorph.forEach(v => morphView(v, false, true))
    }

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
