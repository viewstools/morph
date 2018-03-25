import { getProp, isTag } from '../utils.js'

export default (node, parent, code) => {
  switch (node.name) {
    case 'borderTopStyle':
    case 'borderBottomStyle':
    case 'borderLeftStyle':
    case 'borderRightStyle':
      return {
        borderStyle: node.value,
      }

    case 'shadowColor':
    case 'shadowBlur':
    case 'shadowOffsetX':
    case 'shadowOffsetY':
      return getShadow(node, parent)

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
        [node.name]: node.value,
      }
  }
}

const getFontFamily = (node, parent) => {
  const fontWeight = getProp(parent, 'fontWeight')
  // const key = node.key.value
  const fontFamily = node.value.replace(/\s/g, '')

  return fontWeight ? `${fontFamily}-${fontWeight.value}` : fontFamily
}

const getLineHeight = (node, parent) => {
  const fontSize = getProp(parent, 'fontSize')
  // using a default font size of 16 if none specified
  const fontSizeValue = fontSize ? fontSize.value : 16
  return node.value * fontSizeValue
}

const getShadow = (node, parent) => {
  const shadowColor = getProp(parent, 'shadowColor')
  const shadowBlur = getProp(parent, 'shadowBlur')
  const shadowOffsetX = getProp(parent, 'shadowOffsetX')
  const shadowOffsetY = getProp(parent, 'shadowOffsetY')

  return {
    // Android
    elevation: 1,
    // iOS,
    shadowOffset: {
      width: shadowOffsetX ? shadowOffsetX.value : undefined,
      height: shadowOffsetY ? shadowOffsetY.value : undefined,
    },
    shadowRadius: shadowBlur ? shadowBlur.value : undefined,
    shadowOpacity: 1,
    shadowColor: shadowColor ? shadowColor.value : undefined,
  }
}

const getTransformValue = (prop, unit) =>
  prop && { [prop.name]: unit ? `${prop.value}${unit}` : prop.value }

const getTransform = (node, parent) => {
  const rotate = getProp(parent, 'rotate')
  const rotateX = getProp(parent, 'rotateX')
  const rotateY = getProp(parent, 'rotateY')
  const scale = getProp(parent, 'scale')
  const translateX = getProp(parent, 'translateX')
  const translateY = getProp(parent, 'translateY')

  return [
    getTransformValue(rotate, 'deg'),
    getTransformValue(rotateX, 'deg'),
    getTransformValue(rotateY, 'deg'),
    getTransformValue(scale),
    getTransformValue(translateX),
    getTransformValue(translateY),
  ].filter(Boolean)
}
