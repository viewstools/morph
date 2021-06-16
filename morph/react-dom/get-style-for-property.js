import {
  getProp,
  getScopedCondition,
  isSlot,
  maybeMakeHyphenated,
} from '../utils.js'
import { maybeAddFallbackFont } from '../fonts.js'
import getUnit from '../get-unit.js'

export default function getStyleForProperty(node, parent, state, code) {
  let scopedVar = setScopedVar(node, parent, state)

  if (node.tags.designToken) {
    return {
      _isScoped: !!scopedVar,
      [node.name]: asVar(node),
    }
  }

  if (scopedVar) {
    switch (node.name) {
      case 'rotate':
      case 'rotateX':
      case 'rotateY':
      case 'scale':
      case 'scaleX':
      case 'scaleY':
      case 'translateX':
      case 'translateY':
        return {
          _isScoped: true,
          transform: getTransform(node, parent, state),
        }

      case 'shadowColor':
      case 'shadowBlur':
      case 'shadowOffsetX':
      case 'shadowOffsetY':
      case 'shadowSpread':
      case 'shadowInset': {
        let shadow = getShadow(node, parent, state)
        let key = Object.keys(shadow)[0]

        return {
          _isScoped: true,
          [key]: shadow[key],
        }
      }

      default:
        return {
          _isScoped: true,
          [node.name]: scopedVar,
        }
    }
  }

  switch (node.name) {
    case 'appRegion':
      return {
        WebkitAppRegion: maybeAsVar(node, code),
      }

    case 'backgroundImage':
      return {
        backgroundImage: code ? `url(${asVar(node)})` : `url("${node.value}")`,
      }

    // see here for variable format with fallback values: https://www.w3.org/TR/css-variables/#using-variables
    case 'fontFamily':
      return {
        fontFamily: code
          ? asVar({ name: `${node.name}, ${getSystemDefaultFont()}` })
          : `${maybeAddFallbackFont(node.value)}, ${getSystemDefaultFont()}`,
      }

    case 'shadowColor':
    case 'shadowBlur':
    case 'shadowOffsetX':
    case 'shadowOffsetY':
    case 'shadowSpread':
    case 'shadowInset':
      return getShadow(node, parent, state)

    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'scale':
    case 'scaleX':
    case 'scaleY':
    case 'translateX':
    case 'translateY':
      return { transform: getTransform(node, parent, state) }

    case 'transformOriginX':
    case 'transformOriginY':
      return {
        transformOrigin: getTransformOrigin(node, parent, state),
      }

    case 'zIndex':
      return {
        zIndex: code ? asVar(node) : parseInt(node.value, 10),
      }

    default:
      return {
        [node.name]: maybeAsVar(node, code),
      }
  }
}

function getSystemDefaultFont() {
  return 'sans-serif'
}

function maybeAsVar(prop, code) {
  return code
    ? asVar(prop)
    : maybeAddUnit({
        name: prop.name,
        value: maybeMakeHyphenated(prop),
      })
}

function maybeAddUnit(prop) {
  if (typeof prop.value === 'number') {
    let unit = getUnit(prop, true)
    return unit ? `${prop.value}${unit}` : prop.value
  }

  return prop.value
}

function asVar(prop) {
  return `var(--${prop.name})`
}

function setScopedVar(prop, block, state) {
  if (
    prop.scope === 'isHovered' ||
    prop.scope === 'isFocused' ||
    prop.scope === 'isDisabled'
  )
    return false

  let scopedCondition = getScopedCondition(prop, block, state)
  return scopedCondition && asVar(prop)
}

function getPropValue(prop, block, state, unit = '') {
  if (!prop) return false

  let scopedVar = setScopedVar(prop, block, state)

  if (scopedVar) return scopedVar

  if (prop.tags.slot) {
    return `var(--${prop.name})`
  }

  return typeof prop.value === 'number' ? `${prop.value}${unit}` : prop.value
}

let getShadow = (node, parent, state) => {
  let isText = parent.name === 'Text'

  let shadowColor = getProp(parent, 'shadowColor', node.scope)
  let shadowBlur = getProp(parent, 'shadowBlur', node.scope)
  let shadowOffsetX = getProp(parent, 'shadowOffsetX', node.scope)
  let shadowOffsetY = getProp(parent, 'shadowOffsetY', node.scope)
  let shadowSpread = getProp(parent, 'shadowSpread', node.scope)
  let shadowInset = getProp(parent, 'shadowInset', node.scope)
  let shadowInsetValue = getPropValue(shadowInset, parent, state)

  let value = [
    !isText &&
      (typeof shadowInsetValue === 'string' && /var\(/.test(shadowInsetValue)
        ? shadowInsetValue
        : shadowInsetValue && 'inset'),
    getPropValue(shadowOffsetX, parent, state, 'px'),
    getPropValue(shadowOffsetY, parent, state, 'px'),
    getPropValue(shadowBlur, parent, state, 'px'),
    !isText && getPropValue(shadowSpread, parent, state, 'px'),
    getPropValue(shadowColor, parent, state),
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/'/g, '')

  if (
    isSlot(shadowColor) ||
    isSlot(shadowBlur) ||
    isSlot(shadowOffsetY) ||
    isSlot(shadowOffsetX) ||
    isSlot(shadowSpread) ||
    isSlot(shadowInset)
  ) {
    value = `\`${value}\``
  }

  return {
    [isText ? 'textShadow' : 'boxShadow']: value,
  }
}

function getTransformValue(prop, parent, unit) {
  if (!prop) return false
  return `${prop.name}(${getPropValue(prop, parent, unit)})`
}

function getTransform(node, parent) {
  let rotate = getProp(parent, 'rotate', node.scope)
  let rotateX = getProp(parent, 'rotateX', node.scope)
  let rotateY = getProp(parent, 'rotateY', node.scope)
  let scale = getProp(parent, 'scale', node.scope)
  let scaleX = getProp(parent, 'scaleX', node.scope)
  let scaleY = getProp(parent, 'scaleY', node.scope)
  let translateX = getProp(parent, 'translateX', node.scope)
  let translateY = getProp(parent, 'translateY', node.scope)

  let value = [
    getTransformValue(rotate, parent, 'deg'),
    getTransformValue(rotateX, parent, 'deg'),
    getTransformValue(rotateY, parent, 'deg'),
    getTransformValue(scale, parent, ''),
    getTransformValue(scaleX, parent, ''),
    getTransformValue(scaleY, parent, ''),

    getTransformValue(translateX, parent, 'px'),
    getTransformValue(translateY, parent, 'px'),
  ]
    .filter(Boolean)
    .join(' ')

  // TODO FIXME this is a hack to remove strings because my head is fried
  // and yeah it does what we need for now :)
  return value.replace(/'/g, '')
}

function getTransformOrigin(node, parent) {
  let transformOriginX = getProp(parent, 'transformOriginX', node.scope)
  let transformOriginY = getProp(parent, 'transformOriginY', node.scope)
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

  return value
}
