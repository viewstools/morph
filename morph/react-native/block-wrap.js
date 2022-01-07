import { getFlowPath, getProp } from '../utils.js'
import getBlockName from './get-block-name.js'
import wrap from '../react/wrap.js'

export let enter = (node, parent, state) => {
  let name = getBlockName(node, parent, state)
  if (
    name === 'Text' &&
    parent &&
    (parent.backgroundImage || parent.ensureBackgroundColor)
  ) {
    node.ensureBackgroundColor = true
  }

  let isKeyboardAvoidingView = getProp(node, 'isKeyboardAvoidingView')
  if (node.action) {
    let block = 'TouchableWithoutFeedback'
    let isDisabled = getProp(node, 'isDisabled')
    let onClick = getProp(node, 'onClick')

    let onPress = onClick && wrap(onClick.value)

    if (/^on[A-Z]/.test(onClick.name) && onClick.slotName === 'setFlowTo') {
      // TODO warn if action is used but it isn't in actions (on parser)
      // TODO warn that there's setFlowTo without an id (on parser)
      let setFlowTo = getFlowPath(onClick, parent, state)
      state.use('ViewsUseFlow')
      state.setFlowTo = true

      onPress = `{() => setFlowTo(${setFlowTo})}`
    }

    let key = getProp(node, 'key')

    state.use(block)

    state.render.push(
      `<${block}
          activeOpacity={0.7}
          ${onPress ? `onPress=${onPress}` : ''}
          ${isDisabled ? `disabled=${wrap(isDisabled.value)}` : ''}
          underlayColor='transparent'
          ${node.isInList ? `key={${key ? key.value : 'index'}}` : ''}>`
    )
    node.wrapEnd = `</${block}>`
  } else if (node.goTo) {
    // let goTo = getProp(node, 'goTo')
    // TODO https://facebook.github.io/react-native/docs/linking.html
  } else if (isKeyboardAvoidingView) {
    let block = 'KeyboardAvoidingView'
    state.use(block)
    state.use('Platform')
    state.render.push(`<${block}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>`)
    node.wrapEnd = `</${block}>`
  }
}

export let leave = (node, parent, state) => {
  if (node.wrapEnd) {
    state.render.push(node.wrapEnd)
  }
}
