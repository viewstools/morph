import { getObjectAsString } from '../utils.js'

export function leave(node, parent, state) {
  if (node.childrenProxyMap) {
    state.render.push(
      ` childrenProxyMap={${getObjectAsString(node.childrenProxyMap)}}`
    )
  }
}
