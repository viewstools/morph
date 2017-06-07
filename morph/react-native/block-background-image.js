import { getObjectAsString } from '../utils.js'
import wrap from '../react/wrap.js'

export const enter = (node, parent, state) => {
  if (node.backgroundImage) {
    const source = wrap(getObjectAsString({ uri: node.backgroundImage }))
    state.render.push(` resizeMode="cover" source=${source}`)
  }
}
