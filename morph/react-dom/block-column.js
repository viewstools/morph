import { getProp, isColumn } from '../utils.js'

export function enter(node, parent, state) {
  if (isColumn(node)) {
    debugger
    const dataKey = getProp(node, 'key')

    state.render.push(
      ` dataKey="${dataKey.value}"`
      //   label="Name"
      //   width={width / 3}
      //   className={columnStyle}`
    )
  }
}
