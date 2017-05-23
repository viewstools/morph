import { ACTION, TELEPORT } from './types.js'
import { hasProp, isCode } from './morph-utils.js'
import { makeVisitors, wrap } from './morph-react.js'
import getBody from './react-native/get-body.js'
import getColor from 'color'
import getDependencies from './react-native/get-dependencies.js'
import getStyles from './react-native/get-styles.js'
import morph from './morph.js'

export default ({ getImport, name, view }) => {
  const state = {
    captures: [],
    fonts: [],
    render: [],
    styles: {},
    todos: [],
    uses: [],
  }

  morph(
    view,
    state,
    makeVisitors({
      getBlockName,
      getStyleForProperty,
      getValueForProperty,
      isValidPropertyForBlock,
    })
  )

  if (state.uses.includes('TextInput')) {
    state.uses.push('KeyboardAvoidingView')
    state.render = [
      `<KeyboardAvoidingView behavior='position'>`,
      ...state.render,
      `</KeyboardAvoidingView>`,
    ]
  }

  if (Object.keys(state.styles).length > 0) {
    state.uses.push('StyleSheet')
  }

  return toComponent({ getImport, name, state })
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

const getFontFamily = (node, parent) => {
  const fontWeight = parent.list.find(n => n.key.value === 'fontWeight')
  const key = node.key.value
  const fontFamily = node.value.value.split(',')[0].replace(/\s/g, '')

  return fontWeight ? `${fontFamily}-${fontWeight.value.value}` : fontFamily
}

// support
// /* offset-x | offset-y | color */
// box-shadow: 60px -16px teal;
// /* offset-x | offset-y | blur-radius | color */
// box-shadow: 10px 5px 5px black;
// /* offset-x | offset-y | blur-radius | spread-radius | color */
// box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
//
// https://developer.mozilla.org/en/docs/Web/CSS/box-shadow?v=example
// prop mapping https://github.com/necolas/react-native-web/issues/44#issuecomment-269031472
const getShadow = value => {
  const [offsetX, offsetY, ...parts] = value.split(' ')

  const ret = {
    // Android
    elevation: 1,
    // iOS,
    shadowOffset: {
      height: parseInt(offsetX, 10),
      width: parseInt(offsetY, 10),
    },
  }

  let color
  if (parts.length === 1) {
    color = parts[0]
  } else if (parts.length === 2) {
    color = parts[1]
    ret.shadowRadius = parseInt(parts[0])
  }

  if (color) {
    // TODO what if the color is a prop? do we calculate this on the fly, how?
    if (/props/.test(color)) {
      ret.shadowColor = color
      ret.shadowOpacity = 1
    } else {
      color = getColor(color)
      ret.shadowColor = color.string()
      ret.shadowOpacity = color.valpha
    }
  }

  return ret
}

const getStyleForProperty = (node, parent, code) => {
  const key = node.key.value
  const value = node.value.value

  switch (key) {
    case 'boxShadow':
      return getShadow(value)

    case 'fontFamily':
      return {
        fontFamily: getFontFamily(node, parent),
      }

    case 'zIndex':
      return {
        zIndex: code ? value : parseInt(value, 10),
      }

    default:
      return {
        [key]: value,
      }
  }
}

const getValueForProperty = (node, parent) => {
  const key = node.key.value
  const value = node.value.value

  switch (node.value.type) {
    case 'Literal':
      return typeof value === 'string' && !isCode(node)
        ? JSON.stringify(value)
        : wrap(value)
    // TODO lists
    case 'ArrayExpression':
      return wrap(false)
    // TODO support object nesting
    case 'ObjectExpression':
      return wrap(false)
  }
}

const blacklist = ['overflow', 'overflowX', 'overflowY', 'fontWeight']
const isValidPropertyForBlock = (node, parent) =>
  !blacklist.includes(node.key.value)

const toComponent = ({ getImport, name, state }) => `import React from 'react'
${getDependencies(state.uses, getImport)}

${getStyles(state.styles)}

${getBody({ state, name })}
export default ${name}`
