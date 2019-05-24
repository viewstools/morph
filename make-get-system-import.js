import relativise from './relativise.js'
import path from 'path'

let FILE_USE_FLOW = 'use-flow.js'
let FILE_LOCAL_CONTAINER = 'LocalContainer.js'
let FILE_TRACK_CONTEXT = 'TrackContext.js'

export default function makeGetSystemImport(src) {
  return function getSystemImport(id, file) {
    switch (id) {
      case 'Column':
        // Column is imported from react-virtualized
        break

      case 'ViewsUseFlow':
        return `import * as fromFlow from '${relativise(
          file,
          path.join(src, FILE_USE_FLOW)
        )}'`

      case 'LocalContainer':
        return `import LocalContainer from '${relativise(
          file,
          path.join(src, FILE_LOCAL_CONTAINER)
        )}'`

      case 'TrackContext':
        return `import { TrackContext } from '${relativise(
          file,
          path.join(src, FILE_TRACK_CONTEXT)
        )}'`

      default:
        return false
    }
  }
}
