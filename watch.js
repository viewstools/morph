let { exec } = require('child_process')
let {
  getViewNotFound,
  isViewNameRestricted,
  morph,
  morphFont,
  parse,
} = require('./lib.js')
let chalk = require('chalk')
let chokidar = require('chokidar')
let clean = require('./clean.js')
let debounce = require('debounce')
let ensureBaseCss = require('./ensure-base-css.js')
let ensureFlow = require('./ensure-flow.js')
let ensureLocalContainer = require('./ensure-local-container.js')
let ensureTrackContext = require('./ensure-track-context.js')
let getLatestVersion = require('latest-version')
let flatten = require('flatten')
let fs = require('mz/fs')
let glob = require('fast-glob')
let hasYarn = require('has-yarn')
let morphInlineSvg = require('./morph/inline-svg.js')
let path = require('path')
let toPascalCase = require('to-pascal-case')
let uniq = require('array-uniq')
let readPkgUp = require('read-pkg-up')

let FONT_TYPES = {
  '.otf': 'opentype',
  '.eot': 'eot',
  '.svg': 'svg',
  '.ttf': 'truetype',
  '.woff': 'woff',
  '.woff2': 'woff2',
}

let isMorphedView = f => /\.view\.js$/.test(f)

let isJs = f => path.extname(f) === '.js'
let isLogic = f => /\.view\.logic\.js$/.test(f)
let isView = f => path.extname(f) === '.view'
let isFont = f => Object.keys(FONT_TYPES).includes(path.extname(f))

let getFontFileId = file => path.basename(file).split('.')[0]

let relativise = (from, to) => {
  let r = path.relative(from, to).replace(/\\/g, '/')
  return r.substr(r.startsWith('../..') ? 3 : 1)
}

let onMorphWriteFile = ({ as, file, code }) => fs.writeFile(`${file}.js`, code)

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

    let shouldDisplayWarning = warning => {
      if (!verbose) return false
      return /default value/.test(warning.type) ? warnOfDefaultValue : true
    }

    if (!viewNotFound)
      viewNotFound = name => {
        let warning = `${src}/${name}.view doesn't exist but it is being used. Create the file!`
        verbose && console.log(chalk.magenta(`! ${warning}`))
        return getViewNotFound(as, name, warning)
      }

    let jsComponents = {}
    let isJsComponent = f => {
      if (jsComponents.hasOwnProperty(f)) return jsComponents[f]
      let is = false

      try {
        // TODO async
        let filePath = path.join(src, f)
        let content = fs.readFileSync(filePath, 'utf-8')
        is = /\/\/ @view/.test(content)
      } catch (err) {}

      return (jsComponents[f] = is)
    }

    let isDirectory = f => {
      try {
        // TODO async
        return fs.statSync(f).isDirectory()
      } catch (err) {
        return false
      }
    }

    let filter = fn => (f, a, b) => {
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

    let getImportFileName = (name, file) => {
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
        let logicFile = logic[`${name}.view.logic`]
        if (logicFile) f = logicFile
      }

      let ret = relativise(file, f)

      return isJs(ret) ? ret.replace(/\.js$/, '') : `${ret}.js`
    }

    let addFont = file => {
      let id = getFontFileId(file)
      let type = FONT_TYPES[path.extname(file)]

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
    let removeFont = file => {
      let id = getFontFileId(file)
      instance.customFonts = instance.customFonts.filter(font => font.id !== id)
    }

    let fonts = {}

    let makeGetDomFont = (view, file) => {
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

    let makeGetNativeFonts = view => {
      return fonts => {
        // TODO revisit, it's overwriting the fonts with an empty object, so
        // I'll disable it for now until we have more time to look into it.
        // fs.writeFileSync(
        //   path.join(src, 'fonts.js'),
        //   morphFont({ as, fonts, files: instance.customFonts })
        // )
      }
    }

    let makeGetImport = (view, file) => {
      dependsOn[view] = []

      return (name, isLazy) => {
        // Column is imported from react-virtualized
        if (name === 'Column') return
        if (name === 'ViewsBaseCss') {
          return isBundlingBaseCss
            ? `import '${relativise(file, instance.baseCss)}'`
            : ''
        }

        if (name === 'ViewsUseFlow') {
          return `import * as fromFlow from '${relativise(
            file,
            instance.useFlow
          )}'`
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

        let importPath = getImportFileName(name, file)

        return views[name]
          ? isLazy
            ? `let ${name} = React.lazy(() => import('${importPath}'))`
            : `import ${name} from '${importPath}'`
          : viewNotFound(name)
      }
    }

    let dependsOn = {}
    let responsibleFor = {}
    let logic = {}
    let views = Object.assign({}, map)
    let viewsSources = {}
    let viewsParsed = {}

    let instance = {
      customFonts: [],
      externalDependencies: new Set(),
      dependsOn,
      useFlow: 'use-flow.js',
      flow: {},
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

    let maybeUpdateLocal = supported => {
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

    let addView = filter((f, skipMorph = false) => {
      let { file, view } = toViewPath(f)

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

    let makeResponsibleFor = () => {
      Object.keys(views).forEach(updateResponsibleFor)
    }

    let maybeIsReady = () => {
      let isReady = viewsLeftToBeReady === 0

      if (isReady) return true

      if (viewsLeftToBeReady > 0) {
        viewsLeftToBeReady--

        if (viewsLeftToBeReady === 0) {
          makeResponsibleFor()

          resolve(instance)
        }
      }
    }

    let getPointsOfUseFor = view =>
      Object.keys(dependsOn).filter(dep => dependsOn[dep].includes(view))

    let updateResponsibleFor = viewRaw => {
      let view = viewRaw.split('.')[0]
      let list = []
      let left = getPointsOfUseFor(view)

      while (left.length > 0) {
        let next = left.pop()

        if (!list.includes(next)) {
          list.push(next)
          getPointsOfUseFor(next).forEach(dep => left.push(dep))
        }
      }

      responsibleFor[view] = uniq(flatten(list))

      return responsibleFor[view]
    }

    let addViewSkipMorph = f => addView(f, true)

    let getViewSource = async f => {
      let { view } = toViewPath(f)

      try {
        let rawFile = path.join(src, f)
        let source = await fs.readFile(rawFile, 'utf-8')
        let parsed = parse({ source })
        viewsSources[view] = source
        viewsParsed[view] = parsed

        let warnings = parsed.warnings.filter(shouldDisplayWarning)

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

    let isStory = viewId => {
      try {
        let view = viewsParsed[viewId]
        return view.views[0].properties.some(p => p.name === 'flow')
      } catch (error) {
        console.error(viewId, error)
        return false
      }
    }

    let toMorphQueue = null
    let morphView = filter(async (f, skipRemorph, skipSource) => {
      let { file, view } = toViewPath(f)
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

      let getFont =
        as === 'react-native'
          ? makeGetNativeFonts(view)
          : makeGetDomFont(view, file)
      let getImport = makeGetImport(view, file)
      let calledMaybeIsReady = false

      try {
        let rawFile = path.join(src, f)
        if (!skipSource) {
          await getViewSource(f)
        }

        let res = morph({
          as,
          compile,
          enableAnimated,
          file: { raw: rawFile, relative: file },
          name: view,
          getFont,
          getImport,
          isStory,
          localSupported: instance.localSupported,
          pretty,
          track,
          views: viewsParsed,
        })

        for (let dep of res.dependencies) {
          instance.externalDependencies.add(dep)
        }

        // TODO nested flows
        if (res.flow === 'separate') {
          instance.flow[view] = res.flowDefaultState
        } else {
          delete instance.flow[view]
        }

        let toMorph = {
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

          ensureFlow(path.join(src, instance.useFlow), instance.flow)
        } else {
          await onMorph(toMorph)
        }

        maybeUpdateExternalDependencies()

        if (Array.isArray(res.svgs)) {
          await Promise.all(
            res.svgs.map(async svg => {
              let svgFile = path.resolve(rawFile, '..', svg.source)

              try {
                let inlined = await morphInlineSvg(svgFile)

                // TODO revisit as most of the options don't matter here
                let res = morph({
                  as,
                  compile,
                  enableAnimated,
                  file: { raw: rawFile, relative: file },
                  name: svg.view,
                  getImport,
                  isStory,
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

    let remorphDependenciesFor = async viewRaw => {
      let view = viewRaw.split('.')[0]

      await Promise.all(
        responsibleFor[view].map(dep => morphView(views[dep], true))
      )

      if (Array.isArray(toMorphQueue)) {
        await Promise.all(toMorphQueue.map(onMorph))
      }
    }

    let toViewPath = f => {
      let file = f.replace(/(\.ios|\.android|\.web)/, '')

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

    let removeView = filter(f => {
      let { view } = toViewPath(f)
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

    let watcherOptions = {
      bashNative: ['linux'],
      cwd: src,
      ignore: ['**/node_modules/**', '**/*.view.js'],
    }
    let watcherPattern = [
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

    let fontsDirectory = path.join(src, 'Fonts')
    if (!(await fs.exists(fontsDirectory))) {
      await fs.mkdir(fontsDirectory)
    }
    let customFonts = await glob(
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

    let listToMorph = await glob(watcherPattern, watcherOptions)
    let viewsToMorph = listToMorph.map(addViewSkipMorph).filter(Boolean)

    await Promise.all(viewsToMorph.map(getViewSource))

    viewsLeftToBeReady = viewsToMorph.length
    if (viewsLeftToBeReady === 0) {
      resolve(instance)
    } else {
      viewsToMorph.forEach(v => morphView(v, false, true))
    }

    ensureFlow(path.join(src, instance.useFlow), instance.flow)

    if (!once) {
      let watcher = chokidar.watch(watcherPattern, {
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
