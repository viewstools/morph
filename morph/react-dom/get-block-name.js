import { getProp, hasProp } from '../utils.js'
import toCamelCase from 'to-camel-case'

export default (node, parent, state) => {
  switch (node.name.value) {
    case 'CaptureEmail':
    case 'CaptureFile':
    case 'CaptureInput':
    case 'CaptureNumber':
    case 'CapturePhone':
    case 'CaptureSecure':
    case 'CaptureText':
      return 'input'

    case 'Horizontal':
    case 'Vertical':
      return getGroupBlockName(node, parent)

    case 'Image':
      return 'img'

    case 'Text':
    case 'List':
      return 'div'

    case 'Proxy':
      return null

    case 'Svg':
      return 'svg'

    case 'SvgGroup':
      return 'g'

    case 'SvgCircle':
    case 'SvgEllipse':
    case 'SvgLinearGradient':
    case 'SvgRadialGradient':
    case 'SvgLine':
    case 'SvgText':
    case 'SvgPath':
    case 'SvgPolygon':
    case 'SvgPolyline':
    case 'SvgRect':
    case 'SvgSymbol':
    case 'SvgUse':
    case 'SvgDefs':
    case 'SvgStop':
      return toCamelCase(node.name.value.replace('Svg', ''))

    default:
      return node.name.value
  }
}

const getGroupBlockName = (node, parent) => {
  let name = 'div'

  if (hasProp(node, 'teleportTo')) {
    name = 'Link'
    node.teleport = true
  } else if (hasProp(node, 'goTo')) {
    name = 'a'
    node.goTo = true
  } else if (hasProp(node, 'onClick')) {
    let prevParent = parent
    let canBeButton = true

    while (prevParent && canBeButton) {
      if (prevParent.type === 'Block') {
        canBeButton = !hasProp(prevParent, 'onClick')
      }
      prevParent = prevParent.parent
    }

    if (canBeButton) {
      name = 'button'
    }
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'div'
  }

  if (node.maybeAnimated && name !== 'Link') {
    name = `Animated.${name}`
  }

  return name
}
