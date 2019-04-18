import { getProp, hasProp } from '../utils.js'
import { leave } from '../react/block-name.js'
import handleTable from '../react/block-name-handle-table.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  if (parent && !parent.isBasic && !node.isBasic) return true
  if (node.isFragment && node.children.length === 0) {
    if (node.name === 'View') {
      let name = hasProp(node, 'name')
        ? getProp(node, 'name').value
        : state.name
      state.render.push(`"${name}"`)
    }

    return true
  }

  let name = getBlockName(node, parent, state)
  if (name === null) return true

  state.use(name, node.isLazy)

  if (node.isProxy) {
    name = `props.proxy${name}`
  }

  // TODO remove the use of those because they're just the name and keep one
  node.nameFinal = name
  node.nameTag = name

  if (handleTable(node, parent, state)) return true

  state.render.push(`<${node.nameFinal}`)
}

export { leave }
