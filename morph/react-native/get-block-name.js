import { getProp, hasProp, isCode, isToggle } from '../utils.js'
import makeToggle from '../react/make-toggle.js'
import toPascalCase from 'to-pascal-case'

export default (node, state) => {
  switch (node.name.value) {
    case 'CaptureEmail':
    // case 'CaptureFile':
    case 'CaptureNumber':
    case 'CapturePhone':
    case 'CaptureSecure':
    case 'CaptureText':
      return 'TextInput'

    case 'Horizontal':
    case 'Vertical':
      return getGroupBlockName(node, state)

    case 'List':
      return getListBlockName(node)

    case 'Proxy':
      return getProxyBlockName(node)
    // TODO SvgText should be just Text but the import should be determined from the parent
    // being Svg

    case 'Text':
      return node.maybeAnimated ? `Animated.Text` : 'Text'

    default:
      return node.name.value
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

    if (isToggle(propNode)) {
      const propToToggle = propNode.tags.toggle
      const functionName = `toggle${toPascalCase(propToToggle)}`
      state.remap[propToToggle] = {
        body: makeToggle(functionName, propToToggle),
        fn: functionName,
      }

      node.action = `props.${functionName}`
      return name
    } else {
      node.action = propNode.value.value
    }
  }

  if (hasProp(node, 'backgroundImage')) {
    const propNode = getProp(node, 'backgroundImage')
    node.backgroundImage = isCode(propNode)
      ? propNode.value.value
      : JSON.stringify(propNode.value.value)

    name = 'Image'
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'ScrollView'
  }

  if (node.maybeAnimated && name !== 'Link') {
    name = `Animated.${name}`
  }

  return name
}

const getListBlockName = node =>
  hasProp(node, /^overflow/, v => v === 'auto' || v === 'scroll')
    ? 'ScrollView'
    : 'View'

const getProxyBlockName = node => {
  const from = getProp(node, 'from')
  return from && from.value.value
}
