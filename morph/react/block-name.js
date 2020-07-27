export function leave(node, parent, state) {
  if (node.isDefiningChildrenExplicitly) return

  if (
    (node.isGroup && !parent) ||
    (node.isGroup && node.children.length > 0) ||
    node.explicitChildren
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
