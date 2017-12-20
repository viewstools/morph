import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  let name = getBlockName(node, parent, state)
  if (name === null) return this.skip()

  state.use(/Animated/.test(name) ? 'Animated' : name)
  node.name.finalValue = name
  state.render.push(`<${name}`)
}
