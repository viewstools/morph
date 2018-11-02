export function leave(node, parent, state) {
  if (node.isRoute && state.isReactNative) {
    state.render.push(' {...routeProps}')
  }
}
