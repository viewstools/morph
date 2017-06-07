import { getProp } from '../utils.js'
import getBlockName from './get-block-name.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'

export const enter = (node, parent, state) => {
  const name = getBlockName(node, state)

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
}

export const leave = (node, parent, state) => {
  if (node.wrapEnd) {
    state.render.push(node.wrapEnd)
  }
}
