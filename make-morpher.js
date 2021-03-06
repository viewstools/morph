import {
  makeGetFontImport,
  morphAllFonts,
  processCustomFonts,
} from './fonts.js'
import { promises as fs } from 'fs'
import ensureData from './ensure-data.js'
import ensureFlow from './ensure-flow.js'
import ensureIsBefore from './ensure-is-before.js'
import ensureIsHovered from './ensure-is-hovered.js'
import ensureIsMedia from './ensure-is-media.js'
import ensureTools from './ensure-tools.js'
import ensureGitignore from './ensure-gitignore.js'
import makeGetSystemImport from './make-get-system-import.js'
import morphAllViews from './morph-all-views.js'
import morphAllViewGraphlFiles from './morph-all-view-graphql-files.js'
import parseViews from './parse-views.js'
import processViewCustomFiles from './process-view-custom-files.js'
import processViewFiles from './process-view-files.js'

export default function makeMorpher({
  appName = 'app',
  as = 'react-dom',
  src,
  tools = false,
  verbose = true,
}) {
  let state = {
    appName,
    as,
    src,
    pass: 0,
    tools,
    verbose,
    customFonts: new Map(),
    viewsById: new Map(),
    viewsToFiles: new Map(),
  }

  state.processFiles = async function processFiles({
    filesFontCustom = new Set(),
    filesView = new Set(),
    filesViewCustom = new Set(),
    filesViewLogic = new Set(),
    filesViewGraphql = new Set(),
  }) {
    if (filesFontCustom.size > 0) {
      processCustomFonts({
        customFonts: state.customFonts,
        filesFontCustom,
      })
    }

    // detect .view files
    await processViewFiles({
      filesView,
      filesViewLogic,
      filesViewGraphql,
      viewsById: state.viewsById,
      viewsToFiles: state.viewsToFiles,
    })

    // detect .js files meant to be custom views with "// @view" at the top
    processViewCustomFiles({
      filesViewCustom,
      viewsById: state.viewsById,
      viewsToFiles: state.viewsToFiles,
    })

    // TODO optimise
    // parse views
    parseViews({
      customFonts: state.customFonts,
      filesView,
      src: state.src,
      verbose: state.verbose,
      viewsById: state.viewsById,
      viewsToFiles: state.viewsToFiles,
    })

    let morphedFonts = morphAllFonts({
      as: state.as,
      customFonts: state.customFonts,
      filesView,
      src: state.src,
      viewsToFiles: state.viewsToFiles,
    })

    let morphedViewGraphqlFiles = morphAllViewGraphlFiles({
      appName,
      filesViewGraphql,
      src: state.src,
    })

    // TODO optimise
    // morph views
    let morphedViews = morphAllViews({
      as: state.as,
      filesView,
      getFontImport: makeGetFontImport(state.src),
      getSystemImport: makeGetSystemImport(state.src),
      src,
      tools: state.tools,
      viewsById: state.viewsById,
      viewsToFiles: state.viewsToFiles,
    })

    // TODO optimise, only if they changed, cache, etc
    let viewsFiles = await Promise.all([
      ensureData(state),
      ...ensureFlow(state),
      ensureTools(state),
      ensureIsBefore(state),
      ensureIsHovered(state),
      ensureIsMedia(state),
      ensureGitignore(state),
    ])

    let filesToWrite = [
      ...morphedFonts,
      ...morphedViewGraphqlFiles,
      ...morphedViews,
      ...viewsFiles,
    ].filter(Boolean)

    await Promise.all(
      filesToWrite.map(async ({ file, content }) =>
        fs.writeFile(file, await content, 'utf-8')
      )
    )

    state.pass++
  }

  return state
}
