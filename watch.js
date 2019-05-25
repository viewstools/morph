// import { exec } from 'child_process'
// import { isViewNameRestricted, morphFont } from './index.js'
import {
  getFilesView,
  getFilesViewLogic,
  getFilesViewCustom,
  getFilesFontCustom,
} from './get-files.js'
import {
  ensureFontsDirectory,
  morphAllFonts,
  processCustomFonts,
} from './fonts.js'
import processViewCustomFiles from './process-view-custom-files.js'
import processViewFiles from './process-view-files.js'
import chalk from 'chalk'
// import chokidar from 'chokidar'
// import debounce from 'debounce'
// import ensureFlow from './ensure-flow.js'
// import ensureLocalContainer from './ensure-local-container.js'
// import ensureTrackContext from './ensure-track-context.js'
// import flatten from 'flatten'
// import getLatestVersion from 'latest-version'
// import hasYarn from 'has-yarn'
import makeGetSystemImport from './make-get-system-import.js'
import morphAllViews from './morph-all-views.js'
// import maybeMorph from './maybe-morph.js'
import parseViews from './parse-views.js'
// import readPkgUp from 'read-pkg-up'
// import toPascalCase from 'to-pascal-case'

export default async function watch({
  as = 'react-dom',
  local = 'en',
  once = false,
  src,
  track = false,
  verbose = true,
}) {
  let viewsById = new Map()
  let viewsToFiles = new Map()
  let customFonts = new Map()

  let [
    filesView,
    filesViewLogic,
    filesViewCustom,
    filesFontCustom,
  ] = await Promise.all([
    getFilesView(src),
    getFilesViewLogic(src),
    getFilesViewCustom(src),
    getFilesFontCustom(src),
  ])

  ensureFontsDirectory(src)
  processCustomFonts({
    customFonts,
    files: filesFontCustom,
  })

  // detect .view files
  await processViewFiles({ filesView, filesViewLogic, viewsById, viewsToFiles })

  // detect .js files meant to be custom views with "// @view" at the top
  processViewCustomFiles({ files: filesViewCustom, viewsById, viewsToFiles })

  verbose &&
    console.log(
      `${chalk.yellow('A')} ${[...viewsById.keys()].sort().join(', ')}`
    )

  // parse views
  parseViews({
    customFonts,
    verbose,
    viewsById,
    viewsToFiles,
  })

  if (customFonts.size > 0) {
    verbose &&
      console.log(`Custom fonts: ${[...customFonts.keys()].sort().join(', ')}`)
  }

  await morphAllFonts({
    as,
    customFonts,
    src,
    viewsToFiles,
  })

  // morph views
  let getSystemImport = makeGetSystemImport(src)

  await morphAllViews({
    as,
    getSystemImport,
    local,
    track,
    viewsById,
    viewsToFiles,
  })

  verbose && console.log(chalk.green('M'))

  if (once) return
}

//   let makeGetDomFont = (view, file) => {
//     return font => {
//       if (!fonts[font.id]) {
//         fonts[font.id] = `Fonts/${font.id}.js`

//         fs.writeFileSync(
//           path.join(src, fonts[font.id]),
//           morphFont({ as, font, files: instance.customFonts })
//         )
//       }

//       return relativise(file, fonts[font.id])
//     }
//   }

//   let makeGetNativeFonts = view => {
//     return fonts => {
//       // TODO revisit, it's overwriting the fonts with an empty object, so
//       // I'll disable it for now until we have more time to look into it.
//       // fs.writeFileSync(
//       //   path.join(src, 'fonts.js'),
//       //   morphFont({ as, fonts, files: instance.customFonts })
//       // )
//     }
//   }

//   let maybeUpdateExternalDependencies = debounce(async function() {
//     let pkg = await readPkgUp(src)

//     if (!pkg.pkg) return

//     if (!pkg.pkg.dependencies) {
//       pkg.pkg.dependencies = {}
//     }

//     let cwd = path.dirname(pkg.path)
//     let shouldUpdate = false

//     for (let dep of instance.externalDependencies) {
//       if (!(dep in pkg.pkg.dependencies)) {
//         let version = await getLatestVersion(dep)
//         pkg.pkg.dependencies[dep] = `^${version}`

//         console.log(`⚙️  installing Views dependency ${dep} v${version}`)
//         shouldUpdate = true
//       }
//     }

//     if (shouldUpdate) {
//       await fs.writeFile(pkg.path, JSON.stringify(pkg.pkg, null, 2))
//       exec(hasYarn(cwd) ? 'yarn' : 'npm install')
//     }
//   }, 100)

//   let maybeUpdateLocal = supported => {
//     if (local) {
//       if (supported) {
//         supported.forEach(lang => {
//           if (!instance.localSupported.includes(lang)) {
//             instance.localSupported.push(lang)
//           }
//         })
//       }

//       if (instance.localSupported.length > 1) {
//         ensureLocalContainer({
//           as,
//           file: path.join(src, instance.localContainer),
//           fileGetInitialLanguage: path.join(
//             src,
//             instance.localContainerGetInitialLanguage
//           ),
//           supported: instance.localSupported,
//         })
//       }
//     }
//   }

//   if (local) {
//     instance.localContainer = 'LocalContainer.js'
//     instance.localContainerGetInitialLanguage = 'get-initial-language.js'
//     instance.localSupported = [local]

//     maybeUpdateLocal()
//   }

//   if (track) {
//     instance.trackContext = 'TrackContext.js'

//     ensureTrackContext({
//       file: path.join(src, instance.trackContext),
//     })
//   }

//   let addView = (f, skipMorph = false) => {
//     if (dontMorph(f)) return

//     let { file, view } = toViewPath(f)

//     if (isViewNameRestricted(view, as)) {
//       verbose &&
//         console.log(
//           chalk.magenta('X'),
//           view,
//           chalk.dim(`-> ${f}`),
//           'is a Views reserved name. To fix this, change its file name to something else.'
//         )
//       return
//     }

//     if (views[view]) {
//       console.log(
//         chalk.magenta('X'),
//         chalk.dim(`-> ${f}`),
//         `This view will not be morphed as a view with the name ${view} already exists. If you did intend to morph this view please give it a unique name.`
//       )
//       return
//     }

//     verbose && console.log(chalk.yellow('A'), view, chalk.dim(`-> ${f}`))

//     let shouldMorph = isView(file)

//     if (isLogic(file)) {
//       logic[view] = file

//       if (viewsLeftToBeReady === 0) {
//         remorphDependenciesFor(view)
//       }
//     } else {
//       views[view] = file
//     }

//     if (shouldMorph) {
//       if (skipMorph) {
//         return f
//       } else {
//         morphView(f)
//       }
//     }
//   }

//   let makeResponsibleFor = () => {
//     Object.keys(views).forEach(updateResponsibleFor)
//   }

//   let maybeIsReady = () => {
//     let isReady = viewsLeftToBeReady === 0

//     if (isReady) return true

//     if (viewsLeftToBeReady > 0) {
//       viewsLeftToBeReady--

//       if (viewsLeftToBeReady === 0) {
//         makeResponsibleFor()
//       }
//     }
//   }

//   let getPointsOfUseFor = view =>
//     Object.keys(dependsOn).filter(dep => dependsOn[dep].includes(view))

//   let updateResponsibleFor = viewRaw => {
//     let view = viewRaw.split('.')[0]
//     let list = []
//     let left = getPointsOfUseFor(view)

//     while (left.length > 0) {
//       let next = left.pop()

//       if (!list.includes(next)) {
//         list.push(next)
//         getPointsOfUseFor(next).forEach(dep => left.push(dep))
//       }
//     }

//     responsibleFor[view] = uniq(flatten(list))

//     return responsibleFor[view]
//   }

//   let addViewSkipMorph = f => addView(f, true)

//   let getViewSource = async f => {
//     let { view } = toViewPath(f)

//     try {
//       let rawFile = path.join(src, f)
//       let source = await fs.readFile(rawFile, 'utf-8')
//       let parsed = parse({ source, views })
//       viewsSources[view] = source
//       viewsParsed[view] = parsed

//       if (verbose && parsed.warnings.length > 0) {
//         console.error(
//           chalk.red(view),
//           chalk.dim(path.resolve(src, views[view]))
//         )
//         parsed.warnings.forEach(warning => {
//           console.error(
//             `  ${chalk.blue(warning.type)} ${chalk.yellow(
//               `line ${warning.loc.start.line}`
//             )} ${warning.line}`
//           )
//         })
//       }

//       maybeUpdateLocal(parsed.locals)
//     } catch (error) {
//       verbose && console.error(chalk.red('M'), view, error)
//     }
//   }

//   let isStory = viewId => {
//     try {
//       let view = viewsParsed[viewId]
//       return view && view.view.properties.some(p => p.name === 'flow')
//     } catch (error) {
//       console.error(viewId, error)
//       return false
//     }
//   }

//   let morphing = new Set()
//   let toMorphQueue = null
//   let morphView = async (f, skipRemorph, skipSource) => {
//     if (morphing.has(f) || dontMorph(f) || isJs(f)) return

//     let { file, view } = toViewPath(f)
//     if (isViewNameRestricted(view, as)) {
//       verbose &&
//         console.log(
//           chalk.magenta('X'),
//           view,
//           chalk.dim(`-> ${f}`),
//           'is a Views reserved name. To fix this, change its file name to something else.'
//         )
//       return
//     }

//     morphing.add(f)

//     let getFont =
//       as === 'react-native'
//         ? makeGetNativeFonts(view)
//         : makeGetDomFont(view, file)
//     let getImport = makeGetImport(view, file)
//     let calledMaybeIsReady = false

//     try {
//       let rawFile = path.join(src, f)
//       if (!skipSource) {
//         await getViewSource(f)
//       }

//       let res = morph({
//         as,
//         file: { raw: rawFile, relative: file },
//         name: view,
//         getFont,
//         getImport,
//         isStory,
//         localSupported: instance.localSupported,
//         track,
//         views: viewsParsed,
//       })

//       for (let dep of res.dependencies) {
//         instance.externalDependencies.add(dep)
//       }

//       // TODO nested flows
//       if (res.flow === 'separate') {
//         instance.flow[view] = res.flowDefaultState
//       } else {
//         delete instance.flow[view]
//       }

//       let toMorph = {
//         as,
//         code: res.code,
//         dependsOn: dependsOn[view],
//         // responsibleFor: responsibleFor[view],
//         file: rawFile,
//         fonts: res.fonts,
//         slots: res.slots,
//         source: viewsSources[view],
//         view,
//       }

//       if (maybeIsReady()) {
//         calledMaybeIsReady = true
//         // TODO revisit effect of rawView vs view here
//         updateResponsibleFor(view)
//         toMorph.responsibleFor = responsibleFor[view]

//         if (toMorphQueue === null) {
//           toMorphQueue = []
//         }
//         toMorphQueue.push(toMorph)

//         if (!skipRemorph) {
//           await remorphDependenciesFor(view)
//           await Promise.all(toMorphQueue.map(onMorph))
//           toMorphQueue = null
//         }

//         ensureFlow(path.join(src, instance.useFlow), instance.flow)
//       } else {
//         await onMorph(toMorph)
//       }

//       maybeUpdateExternalDependencies()

//       verbose && console.log(chalk.green('M'), view)
//     } catch (error) {
//       verbose && console.error(chalk.red('M'), view, error.codeFrame || error)

//       if (!calledMaybeIsReady) {
//         maybeIsReady()
//       }
//     }

//     morphing.delete(f)
//   }

//   let remorphDependenciesFor = async viewRaw => {
//     let view = viewRaw.split('.')[0]

//     await Promise.all(
//       responsibleFor[view].map(dep => morphView(views[dep], true))
//     )

//     if (Array.isArray(toMorphQueue)) {
//       await Promise.all(toMorphQueue.map(onMorph))
//     }
//   }

//   let toViewPath = f => {
//     let file = f.replace(/(\.ios|\.android|\.web)/, '')

//     let view = path.basename(file)
//     if (isLogic(file)) {
//       view = view.replace(/\.js/, '')
//     } else {
//       view = toPascalCase(view.replace(/\.(js|view)/, ''))
//     }

//     return {
//       file: `./${file}`,
//       view,
//     }
//   }

//   let removeView = f => {
//     if (dontMorph(f)) return

//     let { view } = toViewPath(f)
//     if (isViewNameRestricted(view, as)) return

//     verbose && console.log(chalk.blue('D'), view)

//     if (isLogic(f)) {
//       delete logic[view]
//     } else {
//       delete views[view]
//       delete viewsSources[view]
//       delete viewsParsed[view]
//     }

//     updateResponsibleFor(view)

//     remorphDependenciesFor(view)

//     delete dependsOn[view]
//   }

//   let watcherOptions = {
//     bashNative: ['linux'],
//     cwd: src,
//     ignore: ['**/node_modules/**', '**/*.view.js'],
//   }
//   let watcherPattern = [
//     `**/*.js`,
//     `**/*.view`,
//     `**/*.view.logic.js`,
//     // fonts,
//     'Fonts/*.eot',
//     'Fonts/*.otf',
//     'Fonts/*.ttf',
//     'Fonts/*.svg',
//     'Fonts/*.woff',
//     'Fonts/*.woff2',
//   ].filter(Boolean)

//   ensureFlow(path.join(src, instance.useFlow), instance.flow)

//   if (!once) {
//     let watcher = chokidar.watch(watcherPattern, {
//       cwd: src,
//       ignored: /(node_modules|\.view.js)/,
//       ignoreInitial: true,
//     })

//     if (verbose) {
//       watcher.on('error', console.error.bind(console))
//     }

//     instance.stop = () => watcher.close()

//     watcher.on('add', f => {
//       if (isFont(f)) {
//         addFont(f)
//       } else {
//         addView(f)
//       }
//     })
//     watcher.on('change', f => {
//       morphView(f)
//     })
//     watcher.on('unlink', f => {
//       if (isFont(f)) {
//         removeFont(f)
//       } else {
//         removeView(f)
//       }
//     })
//   }
// }
