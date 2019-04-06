import { getProp } from '../utils.js'
import safe from '../react/safe.js'

export let enter = (node, parent, state) => {
  if (node.teleport) {
    let to = getProp(node, 'teleportTo').value

    state.render.push(` to=${safe(to)}`)
  }
}
