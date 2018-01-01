import { leave } from '../react/block-name.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  let name = getBlockName(node, parent, state)
  if (name === null) return true

  state.use(/Animated/.test(name) ? 'Animated' : name)

  node.nameFinal = name
  state.render.push(`<${name}`)
}

export { leave }
