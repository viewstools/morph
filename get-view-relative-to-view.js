import path from 'path'

export default function getViewRelativeToView({
  id,
  view,
  viewsById,
  viewsToFiles,
}) {
  let importCandidates = viewsById.get(id)
  if (!importCandidates) {
    // TODO add better error message
    console.log('No import candidates for ', id, 'from', view.file)
    importCandidates = new Set()
  }
  let importViewFile = [...importCandidates][0]
  if (importCandidates.size > 1) {
    let pathToView = view.file.replace(/\.view$/, '')
    let maybeFileViewInside = path.join(pathToView, `${id}.view`)
    let maybeFileViewCustomInside = path.join(pathToView, `${id}.js`)

    if (importCandidates.has(maybeFileViewInside)) {
      importViewFile = maybeFileViewInside
    } else if (importCandidates.has(maybeFileViewCustomInside)) {
      importViewFile = maybeFileViewCustomInside
    }
  }

  return viewsToFiles.get(importViewFile)
}
