import { getObjectAsString, hasKeys } from '../utils.js'
import hash from '../hash.js'

export const leave = (node, parent, state) => {
  let style = null

  if (
    parent.ensureBackgroundColor &&
    (!('backgroundColor' in node.style.static.base) ||
      !('backgroundColor' in node.style.dynamic.base))
  ) {
    node.style.static.base.backgroundColor = 'transparent'
  }

  if (hasKeys(node.style.static.base)) {
    const id = hash(node.style.static.base)
    state.styles[id] = node.style.static.base
    parent.styleId = id
    style = `styles.${id}`
  }
  if (hasKeys(node.style.dynamic.base)) {
    const dynamic = getObjectAsString(node.style.dynamic.base)
    style = style ? `[${style},${dynamic}]` : dynamic
  }

  if (style) {
    state.render.push(` style={${style}}`)
  }
}
