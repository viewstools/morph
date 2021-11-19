import relativise from './relativise.js'
import path from 'path'

let FILE_USE_IS_BEFORE = path.join('Views', 'hooks', 'useIsBefore.js')
let FILE_USE_IS_HOVERED = path.join('Views', 'hooks', 'useIsHovered.js')
let FILE_USE_IS_FOCUSED = path.join('Views', 'hooks', 'useIsFocused.js')
let FILE_USE_IS_MEDIA = path.join('Views', 'hooks', 'useIsMedia.js')
let FILE_USE_DATA = path.join('Views', 'Data.js')
let FILE_USE_DATA_FORMAT = path.join('Views', 'Data', 'format.js')
let FILE_USE_DATA_VALIDATE = path.join('Views', 'Data', 'validate.js')
let FILE_USE_DATA_AGGREGATE = path.join('Views', 'Data', 'aggregate.js')
let FILE_USE_DESIGN_TOKENS = path.join('Views', 'DesignTokens.js')
let FILE_USE_FLOW = path.join('Views', 'Flow.js')
let FILE_USE_PROFILE = path.join('Views', 'Profile.js')
let FILE_USE_STREAM = path.join('Views', 'Stream')

export default function makeGetSystemImport({ as, src }) {
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

      case 'ViewsUseIsFocused':
        return `import useIsFocused from '${relativise(
          file,
          path.join(src, FILE_USE_IS_FOCUSED),
          src
        )}'`

      case 'ViewsUseData':
        return `import * as fromData from '${relativise(
          file,
          path.join(src, FILE_USE_DATA),
          src
        )}'`

      case 'ViewsUseDataFormat':
        return `import * as fromViewsFormat from '${relativise(
          file,
          path.join(src, FILE_USE_DATA_FORMAT),
          src
        )}'`

      case 'ViewsUseDataValidate':
        return `import * as fromViewsValidate from '${relativise(
          file,
          path.join(src, FILE_USE_DATA_VALIDATE),
          src
        )}'`

      case 'ViewsUseDataAggregate':
        return `import * as fromViewsAggregate from '${relativise(
          file,
          path.join(src, FILE_USE_DATA_AGGREGATE),
          src
        )}'`

      case 'ViewsUseDesignTokens':
        return `import * as fromDesignTokens from '${relativise(
          file,
          path.join(src, FILE_USE_DESIGN_TOKENS),
          src
        )}'`

      case 'ViewsUseFlow':
        return `import * as fromFlow from '${relativise(
          file,
          path.join(src, FILE_USE_FLOW),
          src
        )}'`

      case 'ViewsUseProfile':
        return `import * as fromProfile from '${relativise(
          file,
          path.join(src, FILE_USE_PROFILE),
          src
        )}'`

      case 'ViewsUseStream':
        return `import ViewsStream from '${relativise(
          file,
          path.join(src, FILE_USE_STREAM, `${as}.js`),
          src
        )}'`

      default:
        return false
    }
  }
}
