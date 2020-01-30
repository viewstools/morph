import { getProp, hasProp, isSlot } from '../utils.js'

export default (node, parent, state) => {
  switch (node.name) {
    case 'Capture':
    case 'CaptureTextArea':
      return 'TextInput'

    case 'Horizontal':
    case 'Vertical':
      return getGroupBlockName(node, state)

    case 'List':
      return getListBlockName(node, state)

    case 'Text':
      if (node.isAnimated) {
        state.animated.add('Text')
        return 'AnimatedText'
      } else {
        return 'Text'
      }

    case 'Block':
    case 'View':
      return 'React.Fragment'

    default:
      return node.name
  }
}

let getGroupBlockName = (node, state) => {
  let name = 'View'

  if (node.isFragment) {
    name = 'React.Fragment'
  } else if (hasProp(node, 'teleportTo')) {
    node.teleport = true
  } else if (hasProp(node, 'goTo')) {
    node.goTo = true
  } else if (hasProp(node, 'onClick')) {
    let propNode = getProp(node, 'onClick')
    node.action = propNode.value
  }

  if (hasProp(node, 'backgroundImage')) {
    let propNode = getProp(node, 'backgroundImage')
    node.backgroundImage = isSlot(propNode)
      ? propNode.value
      : JSON.stringify(propNode.value)

    name = 'Image'
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'ScrollView'
  }

  if (node.isAnimated && name !== 'Link') {
    state.animated.add(name)
    name = `Animated${name}`
  }

  return name
}

let getListBlockName = (node, state) => {
  let base = hasProp(node, /^overflow/, v => v === 'auto' || v === 'scroll')
    ? 'FlatList'
    : 'View'
  if (node.isAnimated) {
    state.animated.add(base)
    return `Animated${base}`
  } else {
    return base
  }
}
