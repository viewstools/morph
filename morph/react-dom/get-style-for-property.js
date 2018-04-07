import { getProp, getScopedCondition, isSlot } from '../utils.js'
import { maybeAddFallbackFont } from '../fonts.js'

export default (node, parent, code) => {
  const scopedCondition = getScopedCondition(node, parent)
  if (scopedCondition) {
    return {
      _isScoped: true,
      [node.name]: getScopedCondition(node, parent),
    }
  }

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
    case 'shadowBlur':
    case 'shadowOffsetX':
    case 'shadowOffsetY':
    case 'shadowSpread':
      return getShadow(node, parent)

    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'scale':
    case 'translateX':
    case 'translateY':
      return {
        transform: getTransform(node, parent),
      }

    case 'transformOriginX':
    case 'transformOriginY':
    case 'transformOriginZ':
      return {
        transformOrigin: getTransformOrigin(node, parent),
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

const getPropValue = (prop, unit = '') => {
  if (!prop) return false

  if (prop.tags.slot) {
    return `\${${prop.value}}${unit}`
  }

  return typeof prop.value === 'number' ? `${prop.value}${unit}` : prop.value
}

const getShadow = (node, parent) => {
  const isText = parent.name === 'Text'

  const shadowColor = getProp(parent, 'shadowColor')
  const shadowBlur = getProp(parent, 'shadowBlur')
  const shadowOffsetX = getProp(parent, 'shadowOffsetX')
  const shadowOffsetY = getProp(parent, 'shadowOffsetY')
  const shadowSpread = getProp(parent, 'shadowSpread')

  let value = [
    getPropValue(shadowOffsetX, 'px'),
    getPropValue(shadowOffsetY, 'px'),
    getPropValue(shadowBlur, 'px'),
    !isText && getPropValue(shadowSpread, 'px'),
    getPropValue(shadowColor),
  ]
    .filter(Boolean)
    .join(' ')

  if (
    isSlot(shadowColor) ||
    isSlot(shadowBlur) ||
    isSlot(shadowOffsetY) ||
    isSlot(shadowOffsetX) ||
    isSlot(shadowSpread)
  ) {
    value = `\`${value}\``
  }

  return {
    [isText ? 'textShadow' : 'boxShadow']: value,
  }
}

const getTransformValue = (prop, unit) => {
  if (!prop) return false
  return `${prop.name}(${getPropValue(prop, unit)})`
}

const getTransform = (node, parent) => {
  const rotate = getProp(parent, 'rotate')
  const rotateX = getProp(parent, 'rotateX')
  const rotateY = getProp(parent, 'rotateY')
  const scale = getProp(parent, 'scale')
  const translateX = getProp(parent, 'translateX')
  const translateY = getProp(parent, 'translateY')

  let value = [
    getTransformValue(rotate, 'deg'),
    getTransformValue(rotateX, 'deg'),
    getTransformValue(rotateY, 'deg'),
    getTransformValue(scale, 'px'),
    getTransformValue(translateX, 'px'),
    getTransformValue(translateY, 'px'),
  ]
    .filter(Boolean)
    .join(' ')

  if (
    isSlot(rotate) ||
    isSlot(rotateX) ||
    isSlot(rotateY) ||
    isSlot(scale) ||
    isSlot(translateX) ||
    isSlot(translateY)
  ) {
    value = `\`${value}\``
  }
  return value
}

const getTransformOrigin = (node, parent) => {
  const transformOriginX = getProp(parent, 'transformOriginX')
  const transformOriginY = getProp(parent, 'transformOriginY')
  let value = [
    getPropValue(
      transformOriginX,
      Number.isInteger(transformOriginX.value) ? 'px' : ''
    ),
    getPropValue(
      transformOriginY,
      Number.isInteger(transformOriginY.value) ? 'px' : ''
    ),
  ]
    .filter(Boolean)
    .join(' ')

  if (isSlot(transformOriginX) || isSlot(transformOriginY)) {
    value = `\`${value}\``
  }
  return value
}
