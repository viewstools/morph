import { getProp, isSlot } from '../utils.js'
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
    case 'shadowBlur':
    case 'shadowOffsetX':
    case 'shadowOffsetY':
    case 'shadowSpread':
      return getShadow(node, parent)

    case 'translateX':
    case 'translateY':
    case 'translateZ':
    case 'scaleX':
    case 'scaleY':
    case 'scaleZ':
    case 'skewX':
    case 'skewY':
    case 'rotateX':
    case 'rotateY':
    case 'rotateZ':
    case 'perspective':
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

  return `${prop.value}${unit}`
}

const getTransformValue = (prop, unit) => {
  if (!prop) return false
  return `${prop.name}(${getPropValue(prop, unit)})`
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

const getTransform = (node, parent) => {
  const translateX = getProp(parent, 'translateX')
  const translateY = getProp(parent, 'translateY')
  const translateZ = getProp(parent, 'translateZ')
  const scaleX = getProp(parent, 'scaleX')
  const scaleY = getProp(parent, 'scaleY')
  const scaleZ = getProp(parent, 'scaleZ')
  const skewX = getProp(parent, 'skewX')
  const skewY = getProp(parent, 'skewY')
  const rotateX = getProp(parent, 'rotateX')
  const rotateY = getProp(parent, 'rotateY')
  const rotateZ = getProp(parent, 'rotateZ')
  const perspective = getProp(parent, 'perspective')

  let value = [
    getTransformValue(translateX, 'px'),
    getTransformValue(translateY, 'px'),
    getTransformValue(translateZ, 'px'),
    getTransformValue(scaleX, 'px'),
    getTransformValue(scaleY, 'px'),
    getTransformValue(scaleZ, 'px'),
    getTransformValue(skewX, 'deg'),
    getTransformValue(skewY, 'deg'),
    getTransformValue(rotateX, 'deg'),
    getTransformValue(rotateY, 'deg'),
    getTransformValue(rotateZ, 'deg'),
    getTransformValue(perspective, 'px'),
  ]
    .filter(Boolean)
    .join(' ')

  if (
    isSlot(translateX) ||
    isSlot(translateY) ||
    isSlot(translateZ) ||
    isSlot(scaleX) ||
    isSlot(scaleY) ||
    isSlot(scaleZ) ||
    isSlot(skewX) ||
    isSlot(skewY) ||
    isSlot(rotateX) ||
    isSlot(rotateY) ||
    isSlot(rotateZ) ||
    isSlot(perspective)
  ) {
    value = `\`${value}\``
  }
  return value
}

const getTransformOrigin = (node, parent) => {
  const transformOriginX = getProp(parent, 'transformOriginX')
  const transformOriginY = getProp(parent, 'transformOriginY')
  const transformOriginZ = getProp(parent, 'transformOriginZ')
  let value = [
    getPropValue(
      transformOriginX,
      Number.isInteger(transformOriginX.value) ? 'px' : ''
    ),
    getPropValue(
      transformOriginY,
      Number.isInteger(transformOriginY.value) ? 'px' : ''
    ),
    getPropValue(transformOriginZ, 'px'),
  ]
    .filter(Boolean)
    .join(' ')

  if (
    isSlot(transformOriginX) ||
    isSlot(transformOriginY) ||
    isSlot(transformOriginZ)
  ) {
    value = `\`${value}\``
  }
  return value
}
