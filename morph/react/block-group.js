export function enter(node, parent, state) {
  if (node.isGroup && node.children.length > 0) {
    state.render.push('>')
  }
}
