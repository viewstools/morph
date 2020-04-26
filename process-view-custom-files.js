import addToMapSet from './add-to-map-set.js'
import getViewIdFromFile from './get-view-id-from-file.js'

export default function processViewCustomFiles({
  filesViewCustom,
  viewsById,
  viewsToFiles,
}) {
  for (let file of filesViewCustom) {
    let id = getViewIdFromFile(file)

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
