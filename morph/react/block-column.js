import { getLabel, getProp, getWidth, isColumn } from '../utils.js'

export function enter(node, parent, state) {
  if (!isColumn(node)) return

  const dataKey = getProp(node, 'key')
  const width = getWidth(node, parent)
  const label = getLabel(node)

  state.render.push(
    ` dataKey="${dataKey.value}" width={${width}} ${
      label ? `label="${label}"` : ''
    }
      ${node.externalHeader ? `headerRenderer={headerRenderer}` : ''}
      cellRenderer={cellRenderer}`
  )
}
