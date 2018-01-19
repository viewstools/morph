import { getProp, hasProp, isCode } from '../utils.js'
import toPascalCase from 'to-pascal-case'

export default (node, parent, state) => {
  switch (node.name) {
    case 'CaptureEmail':
    // case 'CaptureFile':
    case 'CaptureNumber':
    case 'CapturePhone':
    case 'CaptureSecure':
    case 'CaptureText':
    case 'CaptureTextArea':
      return 'TextInput'

    case 'Horizontal':
    case 'Vertical':
      return getGroupBlockName(node, state)

    case 'Image':
      return getImageName(node, state)

    case 'List':
      return getListBlockName(node)

    case 'Proxy':
      return null

    case 'Text':
      return node.maybeAnimated ? `Animated.Text` : 'Text'

    default:
      return node.name
  }
}

const getGroupBlockName = (node, state) => {
  let name = 'View'

  if (hasProp(node, 'teleportTo')) {
    node.teleport = true
  } else if (hasProp(node, 'goTo')) {
    node.goTo = true
  } else if (hasProp(node, 'onClick')) {
    const propNode = getProp(node, 'onClick')
    node.action = propNode.value
  }

  if (hasProp(node, 'backgroundImage')) {
    const propNode = getProp(node, 'backgroundImage')
    node.backgroundImage = isCode(propNode)
      ? propNode.value
      : JSON.stringify(propNode.value)

    name = 'Image'
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'ScrollView'
  }

  if (node.maybeAnimated && name !== 'Link') {
    name = `Animated.${name}`
  }

  return name
}

const getListBlockName = node => {
  const base = hasProp(node, /^overflow/, v => v === 'auto' || v === 'scroll')
    ? 'ScrollView'
    : 'View'
  return node.maybeAnimated ? `Animated.${base}` : base
}

const isSvg = str => /\.svg$/.test(str)
const getImageName = (node, state) => {
  if (hasProp(node, 'source')) {
    const source = getProp(node, 'source')
    const { value } = source.value

    if (isSvg(value)) {
      const name = `${toPascalCase(value)}Inline`
      node.isSvg = true

      if (!state.svgs.some(svg => svg.source === value)) {
        state.svgs.push({
          source: value,
          view: name,
        })
      }
      return name
    }
  }

  return 'Image'
}
