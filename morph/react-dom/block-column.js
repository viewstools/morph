import { getLabel, getProp, isColumn } from '../utils.js'

export function enter(node, parent, state) {
  if (isColumn(node)) {
    const dataKey = getProp(node, 'key')
    const width = getProp(node, 'width')
    const label = getLabel(node)

    if (width) {
      node.properties.splice(node.properties.indexOf(width), 1)
    }

    state.render.push(
      ` dataKey="${dataKey.value}" width={${width.value}} ${
        label ? `label="${label}"` : ''
      }`
    )
  }
}
