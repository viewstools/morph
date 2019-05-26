import addToMapSet from './add-to-map-set.js'
import path from 'path'

export default function processViewCustomFiles({
  filesViewCustom,
  viewsById,
  viewsToFiles,
}) {
  for (let file of filesViewCustom) {
    let id = path.basename(file, '.js')

    addToMapSet(viewsById, id, file)

    viewsToFiles.set(file, {
      custom: true,
      file,
      id,
      logic: false,
      source: null,
      version: 0,
    })
  }
}
