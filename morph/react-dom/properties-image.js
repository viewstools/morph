export let enter = (node, parent, state) => {
  // TODO caption
  if (node.name === 'Image') {
    state.render.push(' alt={""}')
  }
}
