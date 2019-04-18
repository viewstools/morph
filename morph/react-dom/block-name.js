import { getPropValueOrDefault } from '../utils.js'
import { leave } from '../react/block-name.js'
import handleTable from '../react/block-name-handle-table.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  if (parent && !parent.isBasic && !node.isBasic) return true
  if (node.isFragment && node.children.length === 0) {
    if (node.name === 'View') {
      state.render.push(`"${getPropValueOrDefault(node, 'name', state.name)}"`)
    }

    return true
  }

  if (node.isFragment && node.name === 'View') {
    state.flow = getPropValueOrDefault(node, 'flow', 'together')
    state.flowDefaultState = null
  }

  if (!node.isBasic && state.flow === 'separate') {
    state.use('ViewsUseFlow')

    if (state.flowDefaultState === null) {
      state.flowDefaultState = node.name
    }
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
