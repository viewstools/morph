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
import makeGetSystemImport from './make-get-system-import.js'
import morphAllViews from './morph-all-views.js'
import parseViews from './parse-views.js'
import processViewCustomFiles from './process-view-custom-files.js'
import processViewFiles from './process-view-files.js'

export default function makeMorpher({
  as = 'react-dom',
  local = 'en',
  src,
  tools = false,
  track = false,
  verbose = true,
}) {
  let state = {
    as,
    local,
    src,
    tools,
    track,
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

    // TODO optimise
    // morph views
    let morphedViews = morphAllViews({
      as: state.as,
      filesView,
      getFontImport: makeGetFontImport(state.src),
      getSystemImport: makeGetSystemImport(state.src),
      local: state.local,
      tools: state.tools,
      track: state.track,
      viewsById: state.viewsById,
      viewsToFiles: state.viewsToFiles,
    })

    console.time('a')
    let filesToWrite = [
      ...morphedFonts,
      ...morphedViews,
      // TODO optimise, only if they changed, cache, etc
      await ensureData(state),
      await ensureFlow(state),
      await ensureTools(state),
      await ensureIsBefore(state),
      await ensureIsHovered(state),
      await ensureIsMedia(state),
    ].filter(Boolean)
    console.timeEnd('a')

    await Promise.all(
      filesToWrite.map(({ file, content }) =>
        fs.writeFile(file, content, 'utf-8')
      )
    )
  }

  return state
}
