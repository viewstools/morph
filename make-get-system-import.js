import relativise from './relativise.js'
import path from 'path'

let FILE_USE_IS_BEFORE = path.join('Views', 'hooks', 'useIsBefore.js')
let FILE_USE_IS_HOVERED = path.join('Views', 'hooks', 'useIsHovered.js')
let FILE_USE_IS_MEDIA = path.join('Views', 'hooks', 'useIsMedia.js')
let FILE_USE_DATA = path.join('Views', 'Data.js')
let FILE_USE_FLOW = path.join('Views', 'Flow.js')

export default function makeGetSystemImport(src) {
  return function getSystemImport(id, file) {
    switch (id) {
      case 'Column':
        // Column is imported from react-virtualized
        break

      case 'ViewsUseIsMedia':
        return `import useIsMedia from '${relativise(
          file,
          path.join(src, FILE_USE_IS_MEDIA),
          src
        )}'`

      case 'ViewsUseIsBefore':
        return `import useIsBefore from '${relativise(
          file,
          path.join(src, FILE_USE_IS_BEFORE),
          src
        )}'`

      case 'ViewsUseIsHovered':
        return `import useIsHovered from '${relativise(
          file,
          path.join(src, FILE_USE_IS_HOVERED),
          src
        )}'`

      case 'ViewsUseData':
        return `import * as fromData from '${relativise(
          file,
          path.join(src, FILE_USE_DATA),
          src
        )}'`

      case 'ViewsUseFlow':
        return `import * as fromFlow from '${relativise(
          file,
          path.join(src, FILE_USE_FLOW),
          src
        )}'`

      default:
        return false
    }
  }
}
