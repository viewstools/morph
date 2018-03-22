export const enter = (node, parent, state) => {
  if (node.children && node.children.some(child => child.format)) {
    state.hasFormattedChild = true
    state.formats = []
    node.children
      .filter(child => child.format)
      .forEach(child => state.formats.push(child.format))
  }
}
