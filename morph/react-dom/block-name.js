import { leave } from '../react/block-name.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  let name = getBlockName(node, parent, state)
  if (name === null) return true

  node.nameFinal = name
  node.nameTag = name
  state.use(name)

  state.render.push(`<${node.nameFinal}`)
}

export { leave }
