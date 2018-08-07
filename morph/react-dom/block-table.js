import { getProp, isTable } from '../utils.js'

export function enter(node, parent, state) {
  if (isTable(node)) {
    const from = getProp(node, 'from')
    if (!from) return

    state.isTable = true
    state.render.push(
      ` width={width} height={height} rowCount={props.from.length} rowGetter={({ index }) => props.from[index]}`
    )
  }
}

export function leave(node, parent, state) {
  if (isTable(node)) {
    state.render.push(`)}</AutoSizer>`)
  }
}