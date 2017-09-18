import { hasProp, getObjectAsString, getProp } from '../utils.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'

const BORDER_RADIUS = [
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
]

export const enter = (node, parent, state) => {
  if (node.backgroundImage) {
    const source = wrap(getObjectAsString({ uri: node.backgroundImage }))

    let resizeMode = getProp(node, 'backgroundSize')
    resizeMode = safe(resizeMode ? resizeMode.value.value : 'cover')

    state.render.push(` resizeMode=${resizeMode} source=${source}`)

    // hack until https://github.com/facebook/react-native/issues/8885
    // is fixed
    BORDER_RADIUS.forEach(prop => {
      if (hasProp(node, prop)) {
        const propNode = getProp(node, prop)
        state.render.push(` ${prop}={${propNode.value.value}}`)
      }
    })
  }
}
