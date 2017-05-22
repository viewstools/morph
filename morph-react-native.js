import { ACTION, TELEPORT } from './types.js'
import { hasProp, isCode } from './morph-utils.js'
import { makeVisitors, wrap } from './morph-react.js'
import morph from './morph.js'

export default code => {
  const state = {
    fonts: [],
    render: [],
    styles: {},
    todos: [],
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
  hasProp(node, /^overflow/, v => v === 'auto' || v === 'scroll')
    ? 'ScrollView'
    : 'View'

const getValueForProperty = (node, parent) => {
  const key = node.key.value
  const value = node.value.value

  switch (node.value.type) {
    case 'Literal':
      if (typeof value === 'string' && !isCode(node)) {
        return JSON.stringify(value)
      } else {
        return wrap(value)
      }
    // TODO lists
    case 'ArrayExpression':
      return wrap(false)
    // TODO support object nesting
    case 'ObjectExpression':
      return wrap(false)
  }
}

const blacklist = ['overflow', 'overflowX', 'overflowY', 'fontWeight']
const isValidPropertyForBlock = (node, parent) => {
  const key = node.key.value
  // const value = node.value.value

  return !blacklist.includes(key)
}
