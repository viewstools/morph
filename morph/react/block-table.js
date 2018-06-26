import { getProp, isTable } from '../utils.js'

export function enter(node, parent, state) {
  if (isTable(node)) {
    const from = getProp(node, 'from')
    if (!from) return

    state.isTable = true
    state.render.push(`<AutoSizer>{({ height, width }) => ( `)
  }
}

export function leave(node, parent, state) {
  if (isTable(node)) {
    state.render.push(`)}</AutoSizer>`)
  }
}
