import { getLabel, getProp, getWidth, isColumn } from '../utils.js'

export function enter(node, parent, state) {
  if (isColumn(node)) {
    const dataKey = getProp(node, 'key')
    const width = getWidth(node, parent)
    const label = getLabel(node)
    debugger

    if (width) {
      // removing from properties so it's not in the compiled css
      node.properties.splice(node.properties.indexOf(width), 1)
    }

    state.render.push(
      ` dataKey="${dataKey.value}" width={${width}} ${
        label ? `label="${label}"` : ''
      }`
    )
  }
}
