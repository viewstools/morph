export let enter = (node, parent, state) => {
  if (!node.childrenProxyMap) return

  Object.keys(node.childrenProxyMap).forEach(key => {
    state.use(node.childrenProxyMap[key])
    state.render.push(` proxy${key}={${node.childrenProxyMap[key]}}`)
  })
}
