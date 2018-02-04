import { getProp, isProps } from '../utils.js'
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

    case 'shadowColor':
    case 'shadowRadius':
    case 'shadowOffsetX':
    case 'shadowOffsetY':
    case 'shadowSpread':
      return getShadow(node, parent)

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

const getPropValue = (prop, unit = '') => {
  if (!prop) return false

  if (prop.tags.props) {
    return `\${${prop.value}}${unit}`
  }

  return `${prop.value}${unit}`
}

const getShadow = (node, parent) => {
  const isText = parent.name === 'Text'

  const shadowColor = getProp(parent, 'shadowColor')
  const shadowRadius = getProp(parent, 'shadowRadius')
  const shadowOffsetX = getProp(parent, 'shadowOffsetX')
  const shadowOffsetY = getProp(parent, 'shadowOffsetY')
  const shadowSpread = getProp(parent, 'shadowSpread')

  let value = [
    getPropValue(shadowOffsetX, 'px'),
    getPropValue(shadowOffsetY, 'px'),
    getPropValue(shadowRadius, 'px'),
    !isText && getPropValue(shadowSpread, 'px'),
    getPropValue(shadowColor),
  ]
    .filter(Boolean)
    .join(' ')

  if (
    isProps(shadowColor) ||
    isProps(shadowRadius) ||
    isProps(shadowOffsetY) ||
    isProps(shadowOffsetX) ||
    isProps(shadowSpread)
  ) {
    value = `\`${value}\``
  }

  return {
    [isText ? 'textShadow' : 'boxShadow']: value,
  }
}
