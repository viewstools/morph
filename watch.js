import { exec } from 'child_process'
import { isViewNameRestricted, morph, morphFont } from './index.js'
import chalk from 'chalk'
import chokidar from 'chokidar'
import debounce from 'debounce'
import ensureFlow from './ensure-flow.js'
import ensureLocalContainer from './ensure-local-container.js'
import ensureTrackContext from './ensure-track-context.js'
import flatten from 'flatten'
import fs from 'mz/fs.js'
import getFirstLine from 'firstline'
import getLatestVersion from 'latest-version'
import glob from 'fast-glob'
import hasYarn from 'has-yarn'
import parse from './parse/index.js'
import path from 'path'
import readPkgUp from 'read-pkg-up'
import relativise from './relativise.js'
import toPascalCase from 'to-pascal-case'
import uniq from 'array-uniq'

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

let onMorph = ({ file, code }) => fs.writeFile(`${file}.js`, code)

let isViewCustom = source => /^\/\/ @view/.test(source)

let getFiles = async (src, pattern, ignore = []) =>
  new Set(
    await glob(pattern, {
      absolute: true,
      bashNative: ['linux'],
      cwd: src,
      ignore: ['**/node_modules/**', '**/*.view.js', ...ignore],
    })
  )

let getFilesView = src => getFiles(src, ['**/*.view'])
let getFilesViewLogic = src => getFiles(src, ['**/*.view.logic.js'])
let getFilesViewCustom = async src => {
  let allFiles = await getFiles(src, ['**/*.js'], ['**/*.view.logic.js'])
  let files = new Set()

  for await (let file of allFiles) {
    let firstLine = await getFirstLine(file)
    if (isViewCustom(firstLine)) {
      files.add(file)
    }
  }
  return files
}
let getFilesFont = src =>
  getFiles(src, [
    '**/Fonts/*.eot',
    '**/Fonts/*.otf',
    '**/Fonts/*.ttf',
    '**/Fonts/*.svg',
    '**/Fonts/*.woff',
    '**/Fonts/*.woff2',
  ])

let addToMapSet = (map, key, value) => {
  if (!map.has(key)) {
    map.set(key, new Set())
  }
  map.get(key).add(value)
}
let getFileDepth = file => file.split(path.sep).length - 1

let sortByFileDepth = (a, b) => {
  let depthA = getFileDepth(a)
  let depthB = getFileDepth(b)
  let depthDelta = depthA - depthB

  if (depthDelta !== 0) return depthDelta

  return a < b ? 1 : a > b ? -1 : 0
}

let sortSetsInMap = map => {
  for (let [key, value] of map) {
    if (value.size <= 1) continue

    map.set(key, new Set([...value].sort(sortByFileDepth)))
  }
}

let maybePrintWarnings = (view, verbose) => {
  if (!verbose || view.parsed.warnings.length === 0) return

  console.error(chalk.red(view.id), chalk.dim(view.file))

  view.parsed.warnings.forEach(warning => {
    console.error(
      `  ${chalk.yellow(warning.loc.start.line)}: ${chalk.blue(
        warning.type
      )} Line: "${warning.line}"`
    )
  })
}

let maybeMorph = async ({
  as,
  getSystemImport,
  local,
  track,
  view,
  viewsById,
  viewsToFiles,
  verbose,
}) => {
  try {
    let result = morph({
      as,
      getSystemImport,
      local,
      track,
      view,
      viewsById,
      viewsToFiles,
    })

    await fs.writeFile(`${view.file}.js`, result.code, 'utf8')

    view.version++

    verbose &&
      console.log(
        `${chalk.green('M')} ${view.id}@${view.version}:${chalk.dim(view.file)}`
      )
  } catch (error) {
    console.error(chalk.red('M'), view, error.codeFrame || error)
  }
}

let morphAllViews = async ({
  as,
  getSystemImport,
  local,
  track,
  viewsById,
  viewsToFiles,
}) => {
  for await (let view of viewsToFiles.values()) {
    if (view.custom) continue

    await maybeMorph({
      as,
      getSystemImport,
      local,
      track,
      verbose: false,
      view,
      viewsById,
      viewsToFiles,
    })
  }
}

let FILE_USE_FLOW = 'use-flow.js'
let FILE_LOCAL_CONTAINER = 'LocalContainer.js'
let FILE_TRACK_CONTEXT = 'TrackContext.js'

let makeGetSystemImport = src => (id, file) => {
  switch (id) {
    case 'Column':
      // Column is imported from react-virtualized
      break

    case 'ViewsUseFlow':
      return `import * as fromFlow from '${relativise(
        file,
        path.join(src, FILE_USE_FLOW)
      )}'`

    case 'LocalContainer':
      return `import LocalContainer from '${relativise(
        file,
        path.join(src, FILE_LOCAL_CONTAINER)
      )}'`

    case 'TrackContext':
      return `import { TrackContext } from '${relativise(
        file,
        path.join(src, FILE_TRACK_CONTEXT)
      )}'`

    default:
      return false
  }
}

export default async function watch({
  as = 'react-dom',
  local = 'en',
  once = false,
  src = process.cwd(),
  track = false,
  verbose = true,
}) {
  let viewsById = new Map()
  let viewsToFiles = new Map()

  let [
    filesView,
    filesViewLogic,
    filesViewCustom,
    // TODO fonts
    // filesFont,
  ] = await Promise.all([
    getFilesView(src),
    getFilesViewLogic(src),
    getFilesViewCustom(src),
    getFilesFont(src),
  ])

  // detect .view files
  for await (let file of filesView) {
    let id = path.basename(file, '.view')

    addToMapSet(viewsById, id, file)

    viewsToFiles.set(file, {
      custom: false,
      file,
      id,
      logic: filesViewLogic.has(`${file}.logic.js`) && `${file}.logic.js`,
      source: await fs.readFile(file, 'utf8'),
      version: 0,
    })
  }
  // detect .js files meant to be custom views with "// @view" at the top
  for (let file of filesViewCustom) {
    let id = path.basename(file, '.js')

    addToMapSet(viewsById, id, file)

    viewsToFiles.set(file, {
      custom: true,
      file,
      id,
      logic: false,
      source: null,
      version: 0,
    })
  }

  verbose &&
    console.log(`${chalk.yellow('A')} ${[...viewsById.keys()].join(', ')}`)

  // parse views
  for (let view of viewsToFiles.values()) {
    if (view.custom) continue

    view.parsed = parse({
      id: view.id,
      source: view.source,
      views: viewsById,
    })

    maybePrintWarnings(view, verbose)
  }

  sortSetsInMap(viewsById)

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

// export async function other({
//   as = 'react-dom',
//   local = 'en',
//   once = false,
//   src = process.cwd(),
//   track = false,
//   verbose = true,
// }) {
//   let jsComponents = {}
//   let isJsComponent = f => {
//     if (jsComponents.hasOwnProperty(f)) return jsComponents[f]
//     let is = false

//     try {
//       // TODO async
//       let filePath = path.join(src, f)
//       let content = fs.readFileSync(filePath, 'utf-8')
//       is = /\/\/ @view/.test(content)
//     } catch (err) {}

//     return (jsComponents[f] = is)
//   }

//   let isDirectory = f => {
//     try {
//       // TODO async
//       return fs.statSync(f).isDirectory()
//     } catch (err) {
//       return false
//     }
//   }

//   let dontMorph = f =>
//     isMorphedView(f) ||
//     (isJs(f) && !isJsComponent(f) && !isLogic(f)) ||
//     isDirectory(f) ||
//     isFont(f)

//   let getImportFileName = (name, file) => {
//     let f = views[name]

//     if (isView(f)) {
//       let logicFile = logic[`${name}.view.logic`]
//       if (logicFile) f = logicFile
//     }

//     let ret = relativise(file, f)

//     return isJs(ret) ? ret.replace(/\.js$/, '') : `${ret}.js`
//   }

//   let addFont = file => {
//     let id = getFontFileId(file)
//     let type = FONT_TYPES[path.extname(file)]

//     if (instance.customFonts.some(font => font.id === id && font.type === type))
//       return

//     instance.customFonts.push({
//       file,
//       relativeFile: file.replace('Fonts/', './'),
//       id: getFontFileId(file),
//       type,
//     })
//   }
//   let removeFont = file => {
//     let id = getFontFileId(file)
//     instance.customFonts = instance.customFonts.filter(font => font.id !== id)
//   }

//   let fonts = {}

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

//   let makeGetImport = (view, file) => {
//     dependsOn[view] = []

//     return (name, isLazy) => {
//       // Column is imported from react-virtualized
//       if (name === 'Column') return

//       if (name === 'ViewsUseFlow') {
//         return `import * as fromFlow from '${relativise(
//           file,
//           instance.useFlow
//         )}'`
//       }

//       if (name === 'LocalContainer') {
//         return `import LocalContainer from '${relativise(
//           file,
//           instance.localContainer
//         )}'`
//       }

//       if (name === 'TrackContext') {
//         return `import { TrackContext } from '${relativise(
//           file,
//           instance.trackContext
//         )}'`
//       }

//       if (!dependsOn[view].includes(name)) {
//         dependsOn[view].push(name)
//       }
//       // TODO track dependencies to make it easy to rebuild files as new ones get
//       // added, eg logic is added, we need to rebuild upwards

//       let importPath = getImportFileName(name, file)

//       return isLazy
//         ? `let ${name} = React.lazy(() => import('${importPath}'))`
//         : `import ${name} from '${importPath}'`
//     }
//   }

//   let dependsOn = {}
//   let responsibleFor = {}
//   let logic = {}
//   let views = {}
//   let viewsSources = {}
//   let viewsParsed = {}

//   let instance = {
//     customFonts: [],
//     externalDependencies: new Set(),
//     dependsOn,
//     useFlow: 'use-flow.js',
//     flow: {},
//     responsibleFor,
//     logic,
//     views,
//     stop() {},
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

//   let fontsDirectory = path.join(src, 'Fonts')
//   if (!(await fs.exists(fontsDirectory))) {
//     await fs.mkdir(fontsDirectory)
//   }
//   let customFonts = await glob(
//     [
//       // fonts,
//       'Fonts/*.eot',
//       'Fonts/*.otf',
//       'Fonts/*.ttf',
//       'Fonts/*.svg',
//       'Fonts/*.woff',
//       'Fonts/*.woff2',
//     ],
//     watcherOptions
//   )
//   customFonts.forEach(addFont)

//   console.log(
//     'Custom fonts:\n',
//     instance.customFonts.map(f => f.file).join(',\n'),
//     '\n'
//   )

//   let viewsLeftToBeReady = null

//   let listToMorph = await glob(watcherPattern, watcherOptions)
//   let viewsToMorph = listToMorph.map(addViewSkipMorph).filter(Boolean)

//   await Promise.all(viewsToMorph.map(getViewSource))

//   viewsLeftToBeReady = viewsToMorph.length
//   if (viewsLeftToBeReady > 0) {
//     viewsToMorph.forEach(v => morphView(v, false, true))
//   }

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
