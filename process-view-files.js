import { promises as fs } from 'fs'
import addToMapSet from './add-to-map-set.js'
import getViewIdFromFile from './get-view-id-from-file.js'
import path from 'path'

export default async function processViewFiles({
  filesView,
  filesViewLogic,
  viewsById,
  viewsToFiles,
}) {
  await Promise.all(
    [...filesView].map(async file => {
      let id = getViewIdFromFile(file)

      addToMapSet(viewsById, id, file)

      let view = viewsToFiles.has(file) ? viewsToFiles.get(file) : {}
      let logic = path.join(path.dirname(file), 'logic.js')

      viewsToFiles.set(file, {
        ...view,
        custom: false,
        file,
        id,
        logic: filesViewLogic.has(logic) && logic,
        source: await fs.readFile(file, 'utf8'),
        version: view.version ? view.version + 1 : 0,
      })
    })
  )
}
