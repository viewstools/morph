import { promises as fs } from 'fs'
import addToMapSet from './add-to-map-set.js'
import getViewIdFromFile from './get-view-id-from-file.js'

export default async function processViewFiles({
  filesView,
  filesViewLogic,
  viewsById,
  viewsToFiles,
}) {
  for await (let file of filesView) {
    let id = getViewIdFromFile(file)

    addToMapSet(viewsById, id, file)

    let view = viewsToFiles.has(file) ? viewsToFiles.get(file) : {}

    viewsToFiles.set(file, {
      ...view,
      custom: false,
      file,
      id,
      logic: filesViewLogic.has(`${file}.logic.js`) && `${file}.logic.js`,
      source: await fs.readFile(file, 'utf8'),
      version: view.version ? view.version + 1 : 0,
    })
  }
}
