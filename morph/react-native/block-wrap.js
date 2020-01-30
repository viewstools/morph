import { getProp, hasProp } from '../utils.js'
import getBlockName from './get-block-name.js'
import safe from '../react/safe.js'
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

  if (node.action) {
    let block = 'TouchableWithoutFeedback'
    let isDisabled = getProp(node, 'isDisabled')
    let onClick = getProp(node, 'onClick')

    let onPress = wrap(onClick.value)

    if (onClick.slotName === 'setFlowTo' && hasProp(node, 'onClickId')) {
      onPress = `{() => setFlowTo("${getProp(node, 'onClickId').value}")}`
      state.use('ViewsUseFlow')
      state.setFlowTo = true
      // TODO warn if action is used but it isn't in actions (on parser)
      // TODO warn that there's setFlowTo without an id (on parser)
    }

    let key = getProp(node, 'key')

    state.use(block)

    state.render.push(
      `<${block}
          activeOpacity={0.7}
          onPress=${onPress}
          ${isDisabled ? `disabled=${wrap(isDisabled.value)}` : ''}
          underlayColor='transparent'
          ${node.isInList ? `key={${key ? key.value : 'index'}}` : ''}>`
    )
    node.wrapEnd = `</${block}>`
  } else if (node.teleport) {
    state.use('Link')
    let to = getProp(node, 'teleportTo').value

    state.render.push(
      `<Link
          activeOpacity={0.7}
          to=${safe(to)}
          underlayColor='transparent'>`
    )
    node.wrapEnd = '</Link>'
  } else if (node.goTo) {
    // let goTo = getProp(node, 'goTo')
    // TODO https://facebook.github.io/react-native/docs/linking.html
  }
}

export let leave = (node, parent, state) => {
  if (node.wrapEnd) {
    state.render.push(node.wrapEnd)
  }
}
