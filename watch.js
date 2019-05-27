// import { exec } from 'child_process'
import {
  getFilesView,
  getFilesViewLogic,
  getFilesViewCustom,
  getFilesFontCustom,
} from './get-files.js'
import { ensureFontsDirectory } from './fonts.js'
import {
  watchFilesView,
  watchFilesViewLogic,
  watchFilesViewCustom,
  watchFilesFontCustom,
} from './watch-files.js'
import makeProcessFiles from './process-files.js'
import chalk from 'chalk'
// import debounce from 'debounce'
// import ensureLocalContainer from './ensure-local-container.js'
// import ensureTrackContext from './ensure-track-context.js'
// import getLatestVersion from 'latest-version'
// import hasYarn from 'has-yarn'
// import maybeMorph from './maybe-morph.js'
// import readPkgUp from 'read-pkg-up'
// import toPascalCase from 'to-pascal-case'

// import hackMigration from './hack-migration.js'

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

  let processFiles = makeProcessFiles({
    as,
    customFonts,
    local,
    track,
    src,
    verbose,
    viewsById,
    viewsToFiles,
  })

  await ensureFontsDirectory(src)

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

  await processFiles({
    filesFontCustom,
    filesView,
    filesViewCustom,
    filesViewLogic,
  })

  if (verbose) {
    let files = [...viewsToFiles.values()]
      .map(view => {
        if (view.custom) {
          return `${view.id} ${chalk.dim('(custom)')}`
        } else if (view.logic) {
          return `${view.id} ${chalk.dim('(+ logic)')}`
        } else {
          return view.id
        }
      })
      .sort()
      .join(', ')
    console.log(`${chalk.yellow('A')} ${chalk.green('M')} ${files}`)
    if (customFonts.size > 0) {
      console.log(
        chalk.yellow(`\nCustom fonts detected:`),
        [...customFonts.keys()].sort().join(', ')
      )
    }
  }

  // hackMigration({
  //   src,
  //   viewsById,
  //   viewsToFiles,
  // })

  if (once) return

  watchFilesView({
    filesViewLogic,
    processFiles,
    src,
    verbose,
    viewsById,
    viewsToFiles,
  })

  watchFilesViewCustom({
    filesViewLogic,
    processFiles,
    src,
    verbose,
    viewsById,
    viewsToFiles,
  })

  watchFilesViewLogic({
    filesViewLogic,
    processFiles,
    src,
    verbose,
    viewsToFiles,
  })

  watchFilesFontCustom({
    customFonts,
    filesViewLogic,
    processFiles,
    src,
    verbose,
    viewsById,
    viewsToFiles,
  })
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
