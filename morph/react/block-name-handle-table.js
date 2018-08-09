import { getProp, isCell, isHeader, isTable } from '../utils.js'

export default (node, parent, state) => {
  if (isTable(node)) {
    // skip the table if we don't have a from prop
    if (!getProp(node, 'from')) return true

    state.isTable = true
  } else if (isCell(node)) {
    state.cell = node
    return true
  } else if (isHeader(node) && node.name !== 'Text') {
    state.externalHeader = node
    return true
  }

  return false
}
