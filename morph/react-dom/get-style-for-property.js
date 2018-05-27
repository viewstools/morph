import { getProp, getScopedCondition, isSlot } from '../utils.js'
import { maybeAddFallbackFont } from '../fonts.js'

export default (node, parent, code) => {
  const scopedCondition = getScopedCondition(node, parent)

  if (scopedCondition) {
    switch (node.name) {
      case 'rotate':
      case 'rotateX':
      case 'rotateY':
      case 'scale':
      case 'translateX':
      case 'translateY':
        return {
          _isScoped: true,
          transform: `'${getTransform(node, parent)}'`,
        }

      default:
        return {
          _isScoped: true,
          [node.name]: scopedCondition,
        }
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
      const transform = getTransform(node, parent)
      if (transform.includes('props.')) return false

      return { transform }

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

const getPropValue = (prop, block, unit) => {
  if (!prop) return false
  debugger

  const scopedCondition = getScopedCondition(prop, block, false, unit)
  // if (scopedCondition) {
  //   return `\${${scopedCondition}}${unit}`
  // }

  if (scopedCondition) {
    return `var(--${block.nameFinal}-${prop.name})`
  }

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
    getPropValue(shadowOffsetX, parent, 'px'),
    getPropValue(shadowOffsetY, parent, 'px'),
    getPropValue(shadowBlur, parent, 'px'),
    !isText && getPropValue(shadowSpread, parent, 'px'),
    getPropValue(shadowColor, parent),
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

const getTransformValue = (prop, parent, unit) => {
  if (!prop) return false
  return `${prop.name}(${getPropValue(prop, parent, unit)})`
}

const getTransform = (node, parent) => {
  const rotate = getProp(parent, 'rotate')
  const rotateX = getProp(parent, 'rotateX')
  const rotateY = getProp(parent, 'rotateY')
  const scale = getProp(parent, 'scale')
  const translateX = getProp(parent, 'translateX')
  const translateY = getProp(parent, 'translateY')

  let value = [
    getTransformValue(rotate, parent, 'deg'),
    getTransformValue(rotateX, parent, 'deg'),
    getTransformValue(rotateY, parent, 'deg'),
    getTransformValue(scale, parent, ''),
    getTransformValue(translateX, parent, 'px'),
    getTransformValue(translateY, parent, 'px'),
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
      parent,
      Number.isInteger(transformOriginX.value) ? 'px' : ''
    ),
    getPropValue(
      transformOriginY,
      parent,
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
