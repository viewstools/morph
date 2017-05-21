import { ACTION, TELEPORT } from './types.js'
import { hasProp } from './morph-utils.js'
import { makeVisitors } from './morph-react.js'
import morph from './morph.js'

export default code => {
  const state = {
    render: [],
    styles: {},
    uses: [],
  }

  morph(
    code,
    state,
    makeVisitors({
      getBlockName,
      getValueForProperty,
      isValidPropertyForBlock,
    })
  )

  return state
}

const getBlockName = node => {
  switch (node.name.value) {
    case 'CaptureEmail':
    // case 'CaptureFile':
    case 'CaptureInput':
    case 'CaptureNumber':
    case 'CapturePhone':
    case 'CaptureSecure':
    case 'CaptureText':
      return 'TextInput'

    case 'Horizontal':
    case 'Vertical':
      return getGroupBlockName(node)

    case 'List':
      return getListBlockName(node)
      break

    case 'Proxy':
      return getProxyBlockName(node)
      break

    case 'Style':
      return null
    // TODO SvgText should be just Text but the import should be determined from the parent
    // being Svg


    default:
      return node.name.value
  }
}

const getGroupBlockName = node => {
  let name = 'View'

  if (hasProp(node, 'teleportTo')) {
    name = TELEPORT
  } else if (hasProp(node, 'goTo')) {
    name = 'Link'
  } else if (hasProp(node, 'onClick')) {
    name = ACTION
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'ScrollView'
  }
  // TODO hasProp(node, 'backgroundImage')

  return name
}

const getListBlockName = node =>
  hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')
    ? 'ScrollView'
    : 'View'

const getValueForProperty = (node, parent) => {
  const key = node.key.value
  const value = node.value.value

  switch (node.value.type) {
    case 'Literal':
      if (typeof node.value.value === 'string' && !node.tags.includes('code')) {
        return JSON.stringify(node.value.value)
      } else {
        return wrap(number)
      }
    // TODO lists
    case 'ArrayExpression':
      return wrap(false)
    // TODO support object nesting
    case 'ObjectExpression':
      return wrap(false)
  }
}

// TODO
const isValidPropertyForBlock = (node, parent) => {
  // const key = node.key.value
  // const value = node.value.value
  return true
}
