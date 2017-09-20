import { maybeAddFallbackFont } from '../fonts.js'
import safe from './safe.js'

export default (node, parent, code) => {
  const key = node.key.value
  const value = node.value.value

  switch (key) {
    case 'appRegion':
      return {
        WebkitAppRegion: value,
      }

    case 'backgroundImage':
      return {
        backgroundImage: code ? `\`url(\${${value}})\`` : `url("${value}")`,
      }

    case 'fontFamily':
      return {
        fontFamily: code ? value : maybeAddFallbackFont(value),
      }

    case 'userSelect':
      return {
        WebkitUserSelect: value,
      }

    case 'zIndex':
      return {
        zIndex: code ? value : parseInt(value, 10),
      }

    default:
      return {
        [key]: value,
      }
  }
}
