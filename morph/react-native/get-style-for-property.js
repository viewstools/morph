import { getProp, isTag } from '../utils.js'

export default (node, parent, code) => {
  switch (node.name) {
    case 'shadowColor':
    case 'shadowRadius':
    case 'shadowOffsetX':
    case 'shadowOffsetY':
      return getShadow(node, parent)

    case 'fontFamily':
      return {
        fontFamily: getFontFamily(node, parent),
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
  const shadowRadius = getProp(parent, 'shadowRadius')
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
    shadowRadius: shadowRadius ? shadowRadius.value : undefined,
    shadowOpacity: 1,
    shadowColor: shadowColor ? shadowColor.value : undefined,
  }
}
