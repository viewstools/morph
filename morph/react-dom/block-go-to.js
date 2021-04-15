import { getDataForLoc, getProp } from '../utils.js'
import safe from '../react/safe.js'

let DATA_VALUE = /props\.value/

export let enter = (node, parent, state) => {
  if (node.goTo) {
    let { value, loc } = getProp(node, 'goTo')
    let data = getDataForLoc(node, loc)
    if (data && DATA_VALUE.test(value)) {
      value = value.replace('props', data.name)
    }

    state.render.push(
      ` href=${safe(value)} rel='noopener noreferrer' target='_blank'`
    )
  }
}
