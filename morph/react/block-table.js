import { getProp, isTable } from '../utils.js'

export function enter(node, parent, state) {
  if (!isTable(node)) return

  state.render.push(
    ` width={width} height={height} rowCount={Array.isArray(props.from) ? props.from.length : 0} rowGetter={({ index }) => props.from[index]}`
  )
}

export function leave(node, parent, state) {
  if (!isTable(node)) return

  state.render.push(`)}</AutoSizer>`)
}
