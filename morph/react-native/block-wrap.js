import { getScopedCondition, getProp, makeOnClickTracker } from '../utils.js'
import getBlockName from './get-block-name.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'

export const enter = (node, parent, state) => {
  const name = getBlockName(node, parent, state)

  if (
    name === 'Text' &&
    parent &&
    (parent.backgroundImage || parent.ensureBackgroundColor)
  ) {
    node.ensureBackgroundColor = true
  }

  if (node.action) {
    const block = 'TouchableWithoutFeedback'
    const isDisabled = getProp(node, 'isDisabled')
    const onClick = getProp(node, 'onClick')

    const hasScopedActions = getScopedCondition(onClick, node)
    const key = getProp(node, 'key')

    state.use(block)

    state.render.push(
      `<${block}
          activeOpacity={0.7}
          ${
            hasScopedActions
              ? `onPress=${wrap(getScopedCondition(onClick, node))}`
              : `onPress=${wrap(makeOnClickTracker(onClick, state))}`
          }
          ${isDisabled ? `disabled=${wrap(isDisabled.value)}` : ''}
          underlayColor='transparent'
          ${node.isInList ? `key={${key ? key.value : 'index'}}` : ''}>`
    )
    node.wrapEnd = `</${block}>`
  } else if (node.teleport) {
    state.use('Link')
    const to = getProp(node, 'teleportTo').value

    state.render.push(
      `<Link
          activeOpacity={0.7}
          to=${safe(to)}
          underlayColor='transparent'>`
    )
    node.wrapEnd = '</Link>'
  } else if (node.goTo) {
    // const goTo = getProp(node, 'goTo')
    // TODO https://facebook.github.io/react-native/docs/linking.html
  }
}

export const leave = (node, parent, state) => {
  if (node.wrapEnd) {
    state.render.push(node.wrapEnd)
  }
}
