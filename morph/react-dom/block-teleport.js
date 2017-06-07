import { getProp } from '../utils.js'
import safe from '../react/safe.js'

export const enter = (node, parent, state) => {
  if (node.teleport) {
    // TODO relative vs absolute
    const teleportTo = getProp(node, 'teleportTo')
    state.render.push(` to=${safe(teleportTo.value.value, teleportTo)}`)
  }
}
