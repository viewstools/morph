import { getProp } from '../utils.js'
import safe from '../react/safe.js'

export const enter = (node, parent, state) => {
  if (node.goTo) {
    const goTo = getProp(node, 'goTo')
    state.render.push(
      ` href=${safe(
        goTo.value.value,
        goTo
      )} rel='noopener noreferrer' target='_blank'`
    )
  }
}
