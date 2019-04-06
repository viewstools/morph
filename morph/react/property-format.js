export let enter = (node, parent, state) => {
  if (node.children && node.children.some(child => child.format)) {
    state.isFormatted = true
    state.formats = []
    node.children
      .filter(child => child.format)
      .forEach(child => state.formats.push(child.format))
  } else if (node.format && !parent) {
    state.isFormatted = true
    state.formats = []
    state.formats.push(node.format)
  }
}
