import { getProp } from '../utils.js'
import safe from '../react/safe.js'

export const enter = (node, parent, state) => {
  if (node.teleport) {
    const to = getProp(node, 'teleportTo').value

    state.render.push(` to=${safe(to)}`)
  }
}
