export function enter(node, parent, state) {
  const value = state.getValueForProperty(node, parent, state)

  if (value) {
    Object.keys(value).forEach(k => state.render.push(` ${k}=${value[k]}`))
  }
}
