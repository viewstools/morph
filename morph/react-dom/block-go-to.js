import { getProp } from '../utils.js'
import safe from '../react/safe.js'

export let enter = (node, parent, state) => {
  if (node.goTo) {
    let goTo = getProp(node, 'goTo')
    state.render.push(
      ` href=${safe(goTo.value)} rel='noopener noreferrer' target='_blank'`
    )
  }
}
