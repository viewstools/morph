import getViewRelativeToView from '../../get-view-relative-to-view.js'
import relativise from '../../relativise.js'

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

    let importView = getViewRelativeToView({
      id,
      view,
      viewsById,
      viewsToFiles,
    })
    if (!importView) {
      throw new Error(
        `Import "${id}" doesn't exist. It's being imported from ${view.id}.`
      )
    }

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
