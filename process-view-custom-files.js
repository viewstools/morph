import addToMapSet from './add-to-map-set.js'
import path from 'path'

export default function processViewCustomFiles({
  files,
  viewsById,
  viewsToFiles,
}) {
  for (let file of files) {
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
