import { leave } from '../react/block-name.js'
import handleTable from '../react/block-name-handle-table.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  let name = getBlockName(node, parent, state)
  if (name === null) return true

  // TODO remove the use of those because they're just the name and keep one
  node.nameFinal = name
  node.nameTag = name
  state.use(name)

  if (handleTable(node, parent, state)) return true

  state.render.push(`<${node.nameFinal}`)
}

export { leave }
