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
  designSystemImportRoot,
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

      return `console.error(${JSON.stringify(error)})
function ${id}() {
  throw new Error(${JSON.stringify(error)})
}`
    }

    let importPath = relativise(view.file, importView.importFile, src)

    if (designSystemImportRoot && importPath.startsWith('DesignSystem')) {
      importPath = importPath.replace('DesignSystem', designSystemImportRoot)
    }

    return isLazy
      ? `let ${id} = React.lazy(() => import('${importPath}'))`
      : `import ${id} from '${importPath}'`
  }
}
