import maybePrintWarnings from './maybe-print-warnings.js'
import parse from './parse/index.js'
import sortSetsInMap from './sort-sets-in-map.js'

export default function parseViews({
  customFonts,
  verbose,
  viewsById,
  viewsToFiles,
}) {
  for (let view of viewsToFiles.values()) {
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
