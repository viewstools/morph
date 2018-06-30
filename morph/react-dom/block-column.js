import { getLabel, getProp, hasColumnStyles, isColumn } from '../utils.js'

export function enter(node, parent, state) {
  if (isColumn(node)) {
    debugger
    const dataKey = getProp(node, 'key').value
    const width = getProp(node, 'width').value
    const label = getLabel(node)

    state.render.push(
      ` dataKey="${dataKey}" width={${width}} ${
        label ? `label="${label}"` : ''
      } ${hasColumnStyles(node) ? `className={columnStyle}` : ''}`
      //   className={columnStyle}`
    )
  }
}
