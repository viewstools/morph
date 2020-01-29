export function leave(node, parent, state) {
  if (node.isDefiningChildrenExplicitly) return

  if (
    ((!parent && node.isGroup) ||
      node.explicitChildren ||
      (node.isGroup && node.children.length > 0)) &&
    !node.nameFinal.includes('FlatList')
  ) {
    if (!parent && node.isGroup) {
      if (node.children.length === 0) {
        state.render.push('>')
      }

      if (!state.hasAlreadyDefinedChildren) {
        state.hasAlreadyDefinedChildren = true
        state.render.push(`{props.children}`)
      }
    }

    state.render.push(`</${node.nameFinal}>`)
  } else {
    state.render.push('/>')
  }
}
