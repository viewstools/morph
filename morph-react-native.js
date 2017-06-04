import {
  getObjectAsString,
  getProp,
  hasKeys,
  hasProp,
  isCode,
  isTag,
} from './morph-utils.js'
import { makeVisitors, safe, wrap } from './morph-react.js'
import getBody from './react-native/get-body.js'
import getColor from 'color'
import getDependencies from './react-native/get-dependencies.js'
import getStyles from './react-native/get-styles.js'
import hash from './hash.js'
import morph from './morph.js'

export default ({ getImport, name, view }) => {
  const state = {
    captures: [],
    fonts: [],
    render: [],
    styles: {},
    todos: [],
    uses: [],
    use(name) {
      if (!state.uses.includes(name) && !/props/.test(name))
        state.uses.push(name)
    },
  }

  const {
    BlockExplicitChildren,
    BlockName,
    BlockWhen,
    ...visitors
  } = makeVisitors({
    getBlockName,
    getStyleForProperty,
    getValueForProperty,
    isValidPropertyForBlock,
    PropertiesStyleLeave,
  })

  visitors.Block = {
    // TODO Capture*
    // TODO FlatList
    enter(node, parent, state) {
      BlockWhen.enter.call(this, node, parent, state)
      BlockWrap.enter.call(this, node, parent, state)
      BlockName.enter.call(this, node, parent, state)
      BlockCapture.enter.call(this, node, parent, state)
      BlockBackgroundImage.enter.call(this, node, parent, state)
    },
    leave(node, parent, state) {
      BlockExplicitChildren.leave.call(this, node, parent, state)
      BlockName.leave.call(this, node, parent, state)
      BlockWrap.leave.call(this, node, parent, state)
      BlockWhen.leave.call(this, node, parent, state)
    },
  }

  morph(view, state, visitors)

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

  const imports = {
    Link: "import { Link } from 'react-router-native'",
  }

  const finalGetImport = name => imports[name] || getImport(name)

  return toComponent({ getImport: finalGetImport, name, state })
}

const BlockWrap = {
  enter(node, parent, state) {
    const name = getBlockName(node)

    if (
      name === 'Text' &&
      parent &&
      parent.parent &&
      (parent.parent.backgroundImage || parent.parent.ensureBackgroundColor)
    ) {
      node.ensureBackgroundColor = true
    }

    if (node.action) {
      state.use('TouchableHighlight')
      state.render.push(
        `<TouchableHighlight
          activeOpacity={0.7}
          onPress=${wrap(node.action)}
          underlayColor='transparent'>`
      )
      node.wrapEnd = '</TouchableHighlight>'
    } else if (node.teleport) {
      state.use('Link')
      const teleportTo = getProp(node, 'teleportTo')
      state.render.push(
        `<Link
          activeOpacity={0.7}
          to=${safe(teleportTo.value.value, teleportTo)}
          underlayColor='transparent'>`
      )
      node.wrapEnd = '</Link>'
    } else if (node.goTo) {
      // const goTo = getProp(node, 'goTo')
      // TODO https://facebook.github.io/react-native/docs/linking.html
    }
  },
  leave(node, parent, state) {
    if (node.wrapEnd) {
      state.render.push(node.wrapEnd)
    }
  },
}

const BlockBackgroundImage = {
  enter(node, parent, state) {
    if (node.backgroundImage) {
      const source = wrap(getObjectAsString({ uri: node.backgroundImage }))
      state.render.push(` resizeMode="cover" source=${source}`)
    }
  },
}

const BlockCapture = {
  enter(node, parent, state) {
    if (/Capture/.test(node.name.value)) {
      if (node.properties && !hasProp(node, 'ref')) {
        node.properties.skip = true

        const { captureNext } = node
        let onSubmit = getProp(node, 'onSubmit') || null
        if (onSubmit) onSubmit = onSubmit.value.value

        if (captureNext) {
          state.render.push(` blurOnSubmit={false}`)
          state.render.push(
            ` onSubmitEditing={this.$capture${captureNext}? () => this.$capture${captureNext}.focus() : ${onSubmit}}`
          )
          state.render(
            ` returnKeyType = {this.$capture${captureNext}? 'next' : 'go'}`
          )
        } else {
          if (onSubmit) {
            state.render.push(` onSubmitEditing={${onSubmit}}`)
            state.render.push(` returnKeyType="go"`)
          } else {
            state.render.push(` returnKeyType="done"`)
          }
        }
        state.render.push(
          ` onChangeText = {${node.is} => this.setState({ ${node.is} })}`
        )
        state.render.push(` ref={$e => this.$capture${node.is} = $e}`)
        state.render.push(` value={state.${node.is}}`)
      }
    }
  },
}

function PropertiesStyleLeave(node, parent, state) {
  let style = null

  if (
    parent.ensureBackgroundColor &&
    (!('backgroundColor' in node.style.static.base) ||
      !('backgroundColor' in node.style.dynamic.base))
  ) {
    node.style.static.base.backgroundColor = 'transparent'
  }

  if (hasKeys(node.style.static.base)) {
    const id = hash(node.style.static.base)
    state.styles[id] = node.style.static.base
    parent.styleId = id
    style = `styles.${id}`
  }
  if (hasKeys(node.style.dynamic.base)) {
    const dynamic = getObjectAsString(node.style.dynamic.base)
    style = style ? `[${style},${dynamic}]` : dynamic
  }

  if (style) {
    state.render.push(` style={${style}}`)
  }
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

    case 'Proxy':
      return getProxyBlockName(node)
    // TODO SvgText should be just Text but the import should be determined from the parent
    // being Svg

    default:
      return node.name.value
  }
}

const getGroupBlockName = node => {
  let name = 'View'

  if (hasProp(node, 'teleportTo')) {
    node.teleport = true
  } else if (hasProp(node, 'goTo')) {
    node.goTo = true
  } else if (hasProp(node, 'onClick')) {
    node.action = getProp(node, 'onClick').value.value
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

  return name
}

const getListBlockName = node =>
  hasProp(node, /^overflow/, v => v === 'auto' || v === 'scroll')
    ? 'ScrollView'
    : 'View'

const getFontFamily = (node, parent) => {
  const fontWeight = parent.list.find(n => n.key.value === 'fontWeight')
  // const key = node.key.value
  const fontFamily = node.value.value.split(',')[0].replace(/\s/g, '')

  return fontWeight ? `${fontFamily}-${fontWeight.value.value}` : fontFamily
}

const getProxyBlockName = node => {
  const from = getProp(node, 'from')
  return from && from.value.value
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
    ret.shadowRadius = parseInt(parts[0], 10)
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

const getBorder = value => {
  const [borderWidth, borderStyle, borderColor] = value.split(' ')

  return {
    borderColor,
    borderStyle,
    borderWidth: parseInt(borderWidth, 10),
  }
}

const getStyleForProperty = (node, parent, code) => {
  const key = node.key.value
  const value = node.value.value

  switch (key) {
    case 'border':
      return getBorder(value)

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

    case 'color':
      if (
        /Capture/.test(parent.parent.name.value) &&
        isTag(node, 'placeholder')
      ) {
        return {
          _isProp: true,
          placeholderTextColor: value,
        }
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
      return {
        [key]: safe(value, node),
      }
    // TODO lists
    case 'ArrayExpression':
    // TODO support object nesting
    case 'ObjectExpression':
    default:
      return false
  }
}

const blacklist = [
  'backgroundImage',
  'backgroundSize',
  'overflow',
  'overflowX',
  'overflowY',
  'fontWeight',
  'onClick',
  'teleportTo',
  'goTo',
]
const isValidPropertyForBlock = (node, parent) =>
  !blacklist.includes(node.key.value)

const toComponent = ({ getImport, name, state }) => `import React from 'react'
${getDependencies(state.uses, getImport)}

${getStyles(state.styles)}

${getBody({ state, name })}
export default ${name}`
