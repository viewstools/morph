export function leave(node, parent, state) {
  if (
    (!parent && node.isGroup) ||
    node.explicitChildren ||
    (node.isGroup && node.children.length > 0)
  ) {
    if (!parent && node.isGroup) {
      if (node.children.length === 0) {
        state.render.push('>')
      }

      if (!node.usesProxy) {
        state.render.push(`{props.children}`)
      }
    }
    state.render.push(`</${node.nameFinal}>`)
  } else {
    state.render.push('/>')
  }
}
