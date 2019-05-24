import relativise from '../../relativise.js'
import path from 'path'

export default function makeGetImport({
  imports,
  getSystemImport,
  view,
  viewsById,
  viewsToFiles,
}) {
  return function getImport(id, isLazy) {
    if (imports[id]) return imports[id]

    let externalImport = getSystemImport(id, view.file)
    if (externalImport) return externalImport

    if (!viewsById.has(id)) {
      throw new Error(
        `Import "${id}" doesn't exist. It's being imported from ${view.id}.`
      )
    }

    let importCandidates = viewsById.get(id)
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

    let importView = viewsToFiles.get(importViewFile)
    let importFile = importView.file
    if (importView.logic) {
      importFile = importView.logic
    } else if (!importView.custom) {
      importFile = `${importFile}.js`
    }
    let importPath = relativise(view.file, importFile)

    return isLazy
      ? `let ${id} = React.lazy(() => import('${importPath}'))`
      : `import ${id} from '${importPath}'`
  }
}
