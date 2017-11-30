import { getProp, hasProp } from '../utils.js'
import toCamelCase from 'to-camel-case'

export default (node, parent, state) => {
  switch (node.name.value) {
    case 'CaptureEmail':
    case 'CaptureFile':
    case 'CaptureNumber':
    case 'CapturePhone':
    case 'CaptureSecure':
    case 'CaptureText':
      return 'input'

    case 'CaptureTextArea':
      return 'textarea'

    case 'Horizontal':
    case 'Vertical':
      return getGroupBlockName(node, parent, state)

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

const getGroupBlockName = (node, parent, state) => {
  let name = 'div'

  if (hasProp(node, 'teleportTo')) {
    name = 'Link'
    node.teleport = true
  } else if (hasProp(node, 'goTo')) {
    name = 'a'
    node.goTo = true
  } else if (hasProp(node, 'onClick')) {
    const propNode = getProp(node, 'onClick')
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
      node.action = propNode.value.value
    }
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'div'
  } else if (hasProp(node, 'onSubmit')) {
    name = 'form'
  }

  if (
    node.maybeAnimated &&
    state.enableAnimated &&
    name !== 'Link' &&
    name !== 'form'
  ) {
    name = `Animated.${name}`
  }

  return name
}
