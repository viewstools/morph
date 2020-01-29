export function enter(node, parent, state) {
  if (
    !node.isDefiningChildrenExplicitly &&
    node.isGroup &&
    node.children.length > 0 &&
    !node.nameFinal.includes('FlatList')
  ) {
    state.render.push('>')
  }
}
