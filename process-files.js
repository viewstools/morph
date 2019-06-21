import {
  makeGetFontImport,
  morphAllFonts,
  processCustomFonts,
} from './fonts.js'
import ensureFlow from './ensure-flow.js'
import ensureIsBefore from './ensure-is-before.js'
import ensureIsMedia from './ensure-is-media.js'
import makeGetSystemImport from './make-get-system-import.js'
import morphAllViews from './morph-all-views.js'
import parseViews from './parse-views.js'
import processViewCustomFiles from './process-view-custom-files.js'
import processViewFiles from './process-view-files.js'

export default ({
  as,
  customFonts,
  local,
  tools,
  track,
  src,
  verbose,
  viewsById,
  viewsToFiles,
}) =>
  async function processFiles({
    filesFontCustom = new Set(),
    filesView = new Set(),
    filesViewCustom = new Set(),
    filesViewLogic = new Set(),
  }) {
    if (filesFontCustom.size > 0) {
      processCustomFonts({
        customFonts,
        filesFontCustom,
      })
    }

    // detect .view files
    await processViewFiles({
      filesView,
      filesViewLogic,
      viewsById,
      viewsToFiles,
    })

    // detect .js files meant to be custom views with "// @view" at the top
    processViewCustomFiles({ filesViewCustom, viewsById, viewsToFiles })

    // TODO optimise
    // parse views
    parseViews({
      customFonts,
      filesView,
      src,
      verbose,
      viewsById,
      viewsToFiles,
    })

    await morphAllFonts({
      as,
      customFonts,
      filesView,
      src,
      viewsToFiles,
    })

    // morph views
    let getFontImport = makeGetFontImport(src)
    let getSystemImport = makeGetSystemImport(src)

    // TODO optimise
    await morphAllViews({
      as,
      filesView,
      getFontImport,
      getSystemImport,
      local,
      track,
      viewsById,
      viewsToFiles,
    })

    await Promise.all([
      ensureFlow({ src, tools, viewsById, viewsToFiles }),
      ensureIsBefore({ src }),
      ensureIsMedia({ src }),
    ])
  }
