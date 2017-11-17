import { getProp, isCode } from '../utils.js'
import getBlockName from './get-block-name.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'

export const enter = (node, parent, state) => {
  const name = getBlockName(node, parent, state)

  if (
    name === 'Text' &&
    parent &&
    parent.parent &&
    (parent.parent.backgroundImage || parent.parent.ensureBackgroundColor)
  ) {
    node.ensureBackgroundColor = true
  }

  if (node.action) {
    const block = 'TouchableWithoutFeedback'
    const isDisabled = getProp(node, 'isDisabled')
      ? getProp(node, 'isDisabled').value.value
      : null
    state.use(block)

    state.render.push(
      `<${block}
          activeOpacity={0.7}
          onPress=${wrap(node.action)}
          ${isDisabled ? `disabled=${wrap(isDisabled)}` : ''}
          underlayColor='transparent'
          ${node.isInList ? 'key={index}' : ''}>`
    )
    node.wrapEnd = `</${block}>`
  } else if (node.teleport) {
    state.use('Link')
    let to = getProp(node, 'teleportTo').value.value

    if (to.startsWith('/') || to === '..') {
      to = safe(to)
    } else {
      to = isCode(to) ? `\${${to}}` : to
      to = `{\`\${props.match.url === '/' ? '' : props.match.url}/${to}\`}`
      state.withRouter = true
    }

    state.render.push(
      `<Link
          activeOpacity={0.7}
          to=${to}
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
