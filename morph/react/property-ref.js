import wrap from '../react/wrap.js'

export function enter(node, parent, state) {
  if (node.name === 'ref') {
    if (!parent.isBasic) {
      state.hasRefs = true
    }

    // TODO swap for React.forwardRef
    state.render.push(
      ` ${parent.isDynamic ? 'innerRef' : 'ref'}=${wrap(node.value)}`
    )
    return true
  }
}
