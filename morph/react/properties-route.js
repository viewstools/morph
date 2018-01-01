export function leave(node, parent, state) {
  if (node.isRoute) {
    state.render.push(' {...routeProps}')
  }
}
