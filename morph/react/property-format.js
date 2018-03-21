export const enter = (node, parent, state) => {
  if (node.children && node.children.some(child => child.format)) {
    state.hasFormattedChild = true
  }
}
