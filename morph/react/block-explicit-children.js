export function leave(node, parent, state) {
  if (node.explicitChildren) {
    state.render.push('>')
    state.render.push(node.explicitChildren)
  }
}
