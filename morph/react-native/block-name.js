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

  state.use(/Animated/.test(name) ? 'Animated' : name)

  node.nameFinal = name

  if (handleTable(node, parent, state)) return true

  state.render.push(`<${name}`)
}

export { leave }
