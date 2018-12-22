import { leave } from '../react/block-name.js'
import handleTable from '../react/block-name-handle-table.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  let name = getBlockName(node, parent, state)
  if (name === null) return true

  if (name === 'Animated.FlatList') {
    state.use('FlatList')
    name = 'AnimatedFlatList'
  }

  debugger
  state.use(node.isBasic ? name.replace(/^Animated/, '') : name, node.isLazy)

  node.nameFinal = name

  if (handleTable(node, parent, state)) return true

  state.render.push(`<${name}`)
}

export { leave }
