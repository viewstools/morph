import maybePrintWarnings from './maybe-print-warnings.js'
import parse from './parse/index.js'
import sortSetsInMap from './sort-sets-in-map.js'

export default function parseViews({
  customFonts,
  filesView,
  verbose,
  viewsById,
  viewsToFiles,
}) {
  for (let file of filesView) {
    let view = viewsToFiles.get(file)

    if (view.custom) continue

    view.parsed = parse({
      customFonts,
      id: view.id,
      source: view.source,
      views: viewsById,
    })

    maybePrintWarnings(view, verbose)
  }
  sortSetsInMap(viewsById)
}
