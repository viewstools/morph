import { promises as fs } from 'fs'
import addToMapSet from './add-to-map-set.js'
import path from 'path'

export default async function processViewFiles({
  filesView,
  filesViewLogic,
  viewsById,
  viewsToFiles,
}) {
  for await (let file of filesView) {
    let id = path.basename(file, '.view')

    addToMapSet(viewsById, id, file)

    viewsToFiles.set(file, {
      custom: false,
      file,
      id,
      logic: filesViewLogic.has(`${file}.logic.js`) && `${file}.logic.js`,
      source: await fs.readFile(file, 'utf8'),
      version: 0,
    })
  }
}
