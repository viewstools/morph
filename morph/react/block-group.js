export function enter(node, parent, state) {
  if (
    !node.isDefiningChildrenExplicitly &&
    node.isGroup &&
    node.children.length > 0 &&
    !node.nameFinal.includes('FlatList')
  ) {
    state.render.push('>')

    if (!node.isBasic) {
      state.render.push('{childProps => (')
      if (node.children.length > 1) {
        state.render.push('<React.Fragment>')
      }
    }
  }
}

export function leave(node, parent, state) {
  if (
    !node.isDefiningChildrenExplicitly &&
    node.isGroup &&
    node.children.length > 0 &&
    !node.nameFinal.includes('FlatList') &&
    !node.isBasic
  ) {
    if (node.children.length > 1) {
      state.render.push('</React.Fragment>')
    }
    state.render.push(')}')
  }
}
