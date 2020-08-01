import {
  getProp,
  getScopedCondition,
  isTag,
  maybeMakeHyphenated,
} from '../utils.js'

export default function getStyleForProperty(node, parent, state, code) {
  let scopedCondition = getScopedCondition(node, parent, state)
  if (scopedCondition) {
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

      default:
        return {
          _isScoped: true,
          [node.name]: getScopedCondition(node, parent, state),
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
      return getShadowOffset(node, parent, state)

    case 'fontWeight':
    case 'fontFamily':
      return {
        fontFamily: getFontFamily(node, parent, state),
      }

    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'scale':
    case 'scaleX':
    case 'scaleY':
    case 'translateX':
    case 'translateY':
      return {
        transform: getTransform(node, parent, state),
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

function getFontFamily(node, parent, state) {
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

function getLineHeight(node, parent, state) {
  let fontSize = getProp(parent, 'fontSize')
  // using a default font size of 16 if none specified
  let fontSizeValue = fontSize ? fontSize.value : 16
  return node.value * fontSizeValue
}

function getShadowOffset(node, parent, state) {
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

function decorateShadow(obj) {
  obj.elevation = 1 // for Android
  obj.shadowOpacity = 1
  return obj
}

function getPropValue(prop, block, state, unit = '') {
  if (!prop) return false

  let scopedCondition = getScopedCondition(prop, block, state)
  if (scopedCondition) {
    return unit ? `\`\${${scopedCondition}}${unit}\`` : scopedCondition
  }

  if (prop.tags.slot) {
    return `\`\${${prop.value}}${unit}\``
  }

  return typeof prop.value === 'number' && unit
    ? `${prop.value}${unit}`
    : prop.value
}

function getTransformValue(prop, parent, state, unit) {
  return (
    prop && {
      [prop.name]: getPropValue(prop, parent, state, unit),
    }
  )
}

function getTransform(node, parent, state) {
  let rotate = getProp(parent, 'rotate')
  let rotateX = getProp(parent, 'rotateX')
  let rotateY = getProp(parent, 'rotateY')
  let scale = getProp(parent, 'scale')
  let scaleX = getProp(parent, 'scaleX')
  let scaleY = getProp(parent, 'scaleY')
  let translateX = getProp(parent, 'translateX')
  let translateY = getProp(parent, 'translateY')

  return [
    getTransformValue(rotate, parent, state, 'deg'),
    getTransformValue(rotateX, parent, state, 'deg'),
    getTransformValue(rotateY, parent, state, 'deg'),
    getTransformValue(scale, parent, state),
    getTransformValue(scaleX, parent, state),
    getTransformValue(scaleY, parent, state),
    getTransformValue(translateX, parent, state),
    getTransformValue(translateY, parent, state),
  ].filter(Boolean)
}
