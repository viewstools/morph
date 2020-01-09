import {
  getProp,
  getScopedCondition,
  isSlot,
  maybeMakeHyphenated,
} from '../utils.js'
import { maybeAddFallbackFont } from '../fonts.js'

export default (node, parent, code) => {
  let scopedVar = setScopedVar(node, parent)

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
          transform: `'${getTransform(node, parent)}'`,
        }

      case 'shadowColor':
      case 'shadowBlur':
      case 'shadowOffsetX':
      case 'shadowOffsetY':
      case 'shadowSpread':
      case 'shadowInset': {
        let shadow = getShadow(node, parent)
        let key = Object.keys(shadow)[0]

        console.log('shadow', shadow)

        return {
          _isScoped: true,
          [key]: `'${shadow[key]}'`,
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
        backgroundImage: code
          ? `\`url(\${${asVar(node)}})\``
          : `url("${node.value}")`,
      }

    case 'fontFamily':
      return {
        fontFamily: code ? asVar(node) : maybeAddFallbackFont(node.value),
      }

    case 'shadowColor':
    case 'shadowBlur':
    case 'shadowOffsetX':
    case 'shadowOffsetY':
    case 'shadowSpread':
    case 'shadowInset':
      return getShadow(node, parent)

    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'scale':
    case 'scaleX':
    case 'scaleY':
    case 'translateX':
    case 'translateY':
      return { transform: getTransform(node, parent) }

    case 'transformOriginX':
    case 'transformOriginY':
      return {
        transformOrigin: getTransformOrigin(node, parent),
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

let maybeAsVar = (prop, code) =>
  code ? asVar(prop) : maybeMakeHyphenated(prop)

let asVar = prop => `'var(--${prop.name})'`

let setScopedVar = (prop, block) => {
  if (
    prop.scope === 'isHovered' ||
    prop.scope === 'isFocused' ||
    prop.scope === 'isDisabled'
  )
    return false

  let scopedCondition = getScopedCondition(prop, block, false)
  return scopedCondition && asVar(prop)
}

let getPropValue = (prop, block, unit = '') => {
  if (!prop) return false

  let scopedVar = setScopedVar(prop, block)

  if (scopedVar) return scopedVar

  if (prop.tags.slot) {
    return `var(--${prop.name})`
  }

  return typeof prop.value === 'number' ? `${prop.value}${unit}` : prop.value
}

let getShadow = (node, parent) => {
  let isText = parent.name === 'Text'

  let shadowColor = getProp(parent, 'shadowColor', node.scope)
  let shadowBlur = getProp(parent, 'shadowBlur', node.scope)
  let shadowOffsetX = getProp(parent, 'shadowOffsetX', node.scope)
  let shadowOffsetY = getProp(parent, 'shadowOffsetY', node.scope)
  let shadowSpread = getProp(parent, 'shadowSpread', node.scope)
  let shadowInset = getProp(parent, 'shadowInset', node.scope)
  let shadowInsetValue = getPropValue(shadowInset, parent)

  let value = [
    !isText &&
      (typeof shadowInsetValue === 'string' && /var\(/.test(shadowInsetValue)
        ? shadowInsetValue
        : shadowInsetValue && 'inset'),
    getPropValue(shadowOffsetX, parent, 'px'),
    getPropValue(shadowOffsetY, parent, 'px'),
    getPropValue(shadowBlur, parent, 'px'),
    !isText && getPropValue(shadowSpread, parent, 'px'),
    getPropValue(shadowColor, parent),
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

let getTransformValue = (prop, parent, unit) => {
  if (!prop) return false
  return `${prop.name}(${getPropValue(prop, parent, unit)})`
}

let getTransform = (node, parent) => {
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

  if (
    isSlot(rotate) ||
    isSlot(rotateX) ||
    isSlot(rotateY) ||
    isSlot(scale) ||
    isSlot(scaleX) ||
    isSlot(scaleY) ||
    isSlot(translateX) ||
    isSlot(translateY)
  ) {
    value = `\`${value}\``
  }

  // TODO FIXME this is a hack to remove strings because my head is fried
  // and yeah it does what we need for now :)
  return value.replace(/'/g, '')
}

let getTransformOrigin = (node, parent) => {
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

  if (isSlot(transformOriginX) || isSlot(transformOriginY)) {
    value = `\`${value}\``
  }
  return value
}
