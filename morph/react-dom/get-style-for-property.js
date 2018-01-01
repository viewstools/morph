import { maybeAddFallbackFont } from '../fonts.js'

export default (node, parent, code) => {
  switch (node.name) {
    case 'appRegion':
      return {
        WebkitAppRegion: node.value,
      }

    case 'backgroundImage':
      return {
        backgroundImage: code
          ? `\`url(\${${node.value}})\``
          : `url("${node.value}")`,
      }

    case 'fontFamily':
      return {
        fontFamily: code ? node.value : maybeAddFallbackFont(node.value),
      }

    case 'userSelect':
      return {
        WebkitUserSelect: node.value,
      }

    case 'zIndex':
      return {
        zIndex: code ? node.value : parseInt(node.value, 10),
      }

    default:
      return {
        [node.name]: node.value,
      }
  }
}
