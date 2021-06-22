export function enter(node, parent, state) {
  if (parent || !node.isView || !node.isDesignSystemRoot) return

  state.render.push('<fromFlow.ViewsFlow viewPath={viewPathParent}>')
  state.use('ViewsUseFlow')
}

export function leave(node, parent, state) {
  if (parent || !node.isView || !node.isDesignSystemRoot) return

  state.render.push('</fromFlow.ViewsFlow>')
}
