import { getProp, hasRowStyles, isTable } from '../utils.js'

export function enter(node, parent, state) {
  if (isTable(node)) {
    const from = getProp(node, 'from')
    if (!from) return
    debugger

    state.isTable = true
    state.render.push(
      ` width={width} height={height} rowCount={from.length} rowGetter={({ index }) => from[index]} 
      ${hasRowStyles(node) ? `rowClassName={rowStyle}` : ''}
      `
    )
  }
}

export function leave(node, parent, state) {
  if (isTable(node)) {
    state.render.push(`)}</AutoSizer>`)
  }
}
