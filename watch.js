// import { exec } from 'child_process'
import {
  getFilesView,
  getFilesViewLogic,
  getFilesViewCustom,
  getFilesFontCustom,
} from './get-files.js'
import {
  ensureFontsDirectory,
  makeGetFontImport,
  morphAllFonts,
  processCustomFonts,
} from './fonts.js'
import processViewCustomFiles from './process-view-custom-files.js'
import processViewFiles from './process-view-files.js'
import chalk from 'chalk'
// import chokidar from 'chokidar'
// import debounce from 'debounce'
import ensureFlow from './ensure-flow.js'
// import ensureLocalContainer from './ensure-local-container.js'
// import ensureTrackContext from './ensure-track-context.js'
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
  let customFonts = new Map()
  let viewsById = new Map()
  let viewsToFiles = new Map()

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
      console.log(
        `Custom fonts detected: ${[...customFonts.keys()].sort().join(', ')}`
      )
  }

  await morphAllFonts({
    as,
    customFonts,
    src,
    viewsToFiles,
  })

  // morph views
  let getFontImport = makeGetFontImport(src)
  let getSystemImport = makeGetSystemImport(src)
  await morphAllViews({
    as,
    getFontImport,
    getSystemImport,
    local,
    track,
    viewsById,
    viewsToFiles,
  })

  verbose && console.log(chalk.green('M'))

  ensureFlow({ src, viewsById, viewsToFiles })

  if (once) return
}

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

//   let morphView = async (f, skipRemorph, skipSource) => {
//       for (let dep of res.dependencies) {
//         instance.externalDependencies.add(dep)
//       }

//       // TODO nested flows
//       if (res.flow === 'separate') {
//         instance.flow[view] = res.flowDefaultState
//       } else {
//         delete instance.flow[view]
//       }

//         ensureFlow(path.join(src, instance.useFlow), instance.flow)

//       maybeUpdateExternalDependencies()

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
