import getViewRelativeToView from '../../get-view-relative-to-view.js'
import relativise from '../../relativise.js'
import path from 'path'
import chalk from 'chalk'

export default function makeGetImport({
  imports,
  getSystemImport,
  src,
  view,
  viewsById,
  viewsToFiles,
}) {
  return function getImport(id, isLazy) {
    if (imports[id]) return imports[id]

    let externalImport = getSystemImport(id, view.file)
    if (externalImport) return externalImport

    let importView = getViewRelativeToView({
      id,
      view,
      viewsById,
      viewsToFiles,
    })
    if (!importView) {
      let error = `View "${id}" doesn't exist inside ${
        view.id
      } or in the DesignSystem.
It's being imported from ${view.id} at ${view.file}.
Either remove the reference to the view or create a new file ${path.join(
        path.dirname(view.file),
        id,
        'view.blocks'
      )} like

  ${id} View
  is together
`

      console.error(chalk.red(error))

      return `console.error(${JSON.stringify(error)})`
    }

    let importFile = importView.file

    if (importView.logic) {
      importFile = importView.logic
    } else if (!importView.custom) {
      importFile = path.join(path.dirname(importFile), 'view.js')
    }
    let importPath = relativise(view.file, importFile, src)

    return isLazy
      ? `let ${id} = React.lazy(() => import('${importPath}'))`
      : `import ${id} from '${importPath}'`
  }
}
