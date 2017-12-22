import wrap from '../react/wrap.js'

export function enter(node, parent, state) {
  if (node.key.value === 'ref') {
    state.render.push(
      ` ${parent.parent.isDynamic ? 'innerRef' : 'ref'}=${wrap(
        node.value.value
      )}`
    )
    return true
  }
}
