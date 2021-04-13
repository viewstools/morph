import { getProp } from '../utils.js'
import safe from '../react/safe.js'

let DATA_VALUE = /props\.value/

export let enter = (node, parent, state) => {
  if (node.goTo) {
    let { value } = getProp(node, 'goTo')
    if (node.data && DATA_VALUE.test(value)) {
      value = value.replace('props', node.data.name)
    }

    state.render.push(
      ` href=${safe(value)} rel='noopener noreferrer' target='_blank'`
    )
  }
}
