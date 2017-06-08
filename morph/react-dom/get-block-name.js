import { getProp, hasProp } from '../utils.js'

export default node => {
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
      return getGroupBlockName(node)

    case 'Image':
      return 'img'

    case 'Text':
    case 'List':
      return 'div'

    case 'Proxy':
      return getProxyBlockName(node)
    // TODO SvgText should be just Text but the import should be determined from the parent
    // being Svg

    case 'SvgText':
      return 'text'

    case 'Svg':
    case 'Circle':
    case 'Ellipse':
    case 'G':
    case 'LinearGradient':
    case 'RadialGradient':
    case 'Line':
    case 'Path':
    case 'Polygon':
    case 'Polyline':
    case 'Rect':
    case 'Symbol':
    case 'Use':
    case 'Defs':
    case 'Stop':
      return node.name.value.toLowerCase()

    default:
      return node.name.value
  }
}

const getGroupBlockName = node => {
  let name = 'div'

  if (hasProp(node, 'teleportTo')) {
    name = 'Link'
    node.teleport = true
  } else if (hasProp(node, 'goTo')) {
    name = 'a'
    node.goTo = true
  } else if (hasProp(node, 'onClick')) {
    name = 'button'
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'div'
  }

  return name
}

const getProxyBlockName = node => {
  const from = getProp(node, 'from')
  return from && from.value.value
}
