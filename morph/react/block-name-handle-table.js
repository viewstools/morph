import { getProp, isCell, isHeader, isTable } from '../utils.js'

export default (node, parent, state) => {
  if (isTable(node)) {
    const from = getProp(node, 'from')
    // skip the table if we don't have a from prop
    if (!from) return true

    state.isTable = true

    state.render.push(`<AutoSizer>{({ width, height }) => (`)
  } else if (isCell(node)) {
    state.cell = node
    return true
  } else if (isHeader(node) && node.name !== 'Text') {
    state.externalHeader = node
    return true
  }

  return false
}
