import { getProp, hasProp } from '../utils.js'
import toCamelCase from 'to-camel-case'

export default (node, parent, state) => {
  let name = node.name

  switch (node.name) {
    case 'Capture':
      name = 'input'
      break

    case 'CaptureTextArea':
      name = 'textarea'
      break

    case 'Horizontal':
    case 'Vertical':
      name = getGroupBlockName(node, parent, state)
      break

    case 'Image':
      name = 'img'
      break

    case 'Text':
      return 'span'

    case 'List':
      name = 'div'
      break

    case 'Proxy':
      return null

    case 'Svg':
      name = 'svg'
      break

    case 'SvgGroup':
      name = 'g'
      break

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
      name = toCamelCase(node.name.replace('Svg', ''))
      break

    default:
      break
  }

  if (node.hasSpringAnimation) {
    return `animated.${name}`
  }

  return name
}

const getGroupBlockName = (node, parent, state) => {
  let name = 'div'

  if (node.isFragment) {
    name = 'React.Fragment'
  } else if (hasProp(node, 'teleportTo')) {
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
      node.action = propNode.value
    }
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'div'
  } else if (hasProp(node, 'onSubmit')) {
    name = 'form'
  }

  return name
}
