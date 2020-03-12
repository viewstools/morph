export let enter = (node, parent, state) => {
  if (node.isFragment || !process.env.REACT_APP_VIEWS_TOOLS) return

  if (state.pathToStory) {
    state.render.push(` ${state.viewPathKey}="${state.pathToStory}"`)
  } else {
    state.render.push(` ${state.viewPathKey}={props["${state.viewPathKey}"]}`)
  }
}
