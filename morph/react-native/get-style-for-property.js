import {
  getProp,
  getScopedCondition,
  isTag,
  maybeMakeHyphenated,
} from '../utils.js'

export default (node, parent, code) => {
  let scopedCondition = getScopedCondition(node, parent)
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
          transform: getTransform(node, parent),
        }

      default:
        return {
          _isScoped: true,
          [node.name]: getScopedCondition(node, parent),
        }
    }
  }

  switch (node.name) {
    case 'borderTopLeftRadius':
    case 'borderTopRightRadius':
    case 'borderBottomLeftRadius':
    case 'borderBottomRightRadius':
      return {
        [parent.name === 'Image' ? 'borderRadius' : node.name]: node.value,
      }

    case 'borderTopStyle':
    case 'borderBottomStyle':
    case 'borderLeftStyle':
    case 'borderRightStyle':
      return {
        borderStyle: node.value,
      }

    case 'shadowColor':
      return decorateShadow({
        shadowColor: node.value,
      })

    case 'shadowBlur':
      return decorateShadow({
        shadowRadius: node.value,
      })

    case 'shadowOffsetX':
    case 'shadowOffsetY':
      return getShadowOffset(node, parent)

    case 'fontWeight':
    case 'fontFamily':
      return {
        fontFamily: getFontFamily(node, parent),
      }

    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'scale':
    case 'translateX':
    case 'translateY':
      return {
        transform: getTransform(node, parent),
      }

    case 'zIndex':
      return {
        zIndex: code ? node.value : parseInt(node.value, 10),
      }

    case 'color':
      // TODO handle this but differently as we don't have the placeholder tag anymore
      if (/Capture/.test(parent.name) && isTag(node, 'placeholder')) {
        return {
          _isProp: true,
          placeholderTextColor: node.value,
        }
      }
      // Just returning the node.value in cases where if statement is not true
      // Otherwise it was falling through to the next case.
      return {
        color: node.value,
      }

    case 'lineHeight':
      return {
        lineHeight: getLineHeight(node, parent),
      }

    default:
      return {
        [node.name]: maybeMakeHyphenated(node),
      }
  }
}

let getFontFamily = (node, parent) => {
  let fontWeight = getProp(parent, 'fontWeight')
  // let key = node.key.value
  let fontFamily = node.value.replace(/\s/g, '')

  if (fontWeight && (node.tags.slot || fontWeight.tags.slot)) {
    return `\`${node.tags.slot ? '${props.fontFamily}' : fontFamily}-${
      fontWeight.tags.slot ? '${props.fontWeight}' : fontWeight.value
    }\``
  }

  return fontWeight ? `${fontFamily}-${fontWeight.value}` : fontFamily
}

let getLineHeight = (node, parent) => {
  let fontSize = getProp(parent, 'fontSize')
  // using a default font size of 16 if none specified
  let fontSizeValue = fontSize ? fontSize.value : 16
  return node.value * fontSizeValue
}

let getShadowOffset = (node, parent) => {
  let shadowOffsetX = getProp(parent, 'shadowOffsetX')
  let shadowOffsetY = getProp(parent, 'shadowOffsetY')

  return decorateShadow({
    // iOS,
    shadowOffset: {
      width: shadowOffsetX ? shadowOffsetX.value : 0,
      height: shadowOffsetY ? shadowOffsetY.value : 0,
    },
  })
}

let decorateShadow = obj => {
  obj.elevation = 1 // for Android
  obj.shadowOpacity = 1
  return obj
}

let getPropValue = (prop, block, unit = '') => {
  if (!prop) return false

  let scopedCondition = getScopedCondition(prop, block)
  if (scopedCondition) {
    return unit ? `\`\${${scopedCondition}}${unit}\`` : scopedCondition
  }

  if (prop.tags.slot) {
    return `\${${prop.value}}${unit}`
  }

  return typeof prop.value === 'number' && unit
    ? `${prop.value}${unit}`
    : prop.value
}

let getTransformValue = (prop, parent, unit) =>
  prop && {
    [prop.name]: getPropValue(prop, parent, unit),
  }

let getTransform = (node, parent) => {
  let rotate = getProp(parent, 'rotate')
  let rotateX = getProp(parent, 'rotateX')
  let rotateY = getProp(parent, 'rotateY')
  let scale = getProp(parent, 'scale')
  let translateX = getProp(parent, 'translateX')
  let translateY = getProp(parent, 'translateY')

  return [
    getTransformValue(rotate, parent, 'deg'),
    getTransformValue(rotateX, parent, 'deg'),
    getTransformValue(rotateY, parent, 'deg'),
    getTransformValue(scale, parent),
    getTransformValue(translateX, parent),
    getTransformValue(translateY, parent),
  ].filter(Boolean)
}
