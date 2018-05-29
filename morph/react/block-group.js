export function enter(node, parent, state) {
  debugger
  if (
    node.isGroup &&
    node.children.length > 0 &&
    node.nameFinal !== 'FlatList'
  ) {
    state.render.push('>')
  }
}
