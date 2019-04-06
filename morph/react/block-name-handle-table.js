import { getProp, isCell, isHeader, isTable } from '../utils.js'

export default (node, parent, state) => {
  if (isTable(node)) {
    let from = getProp(node, 'from')
    // skip the table if we don't have a from prop
    if (!from) return true

    state.isTable = true

    state.render.push(`<AutoSizer>{({ width, height }) => (`)
  }

  return isCell(node) || isHeader(node)
}
