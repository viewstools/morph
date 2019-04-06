import { hasProp, getObjectAsString, getProp } from '../utils.js'
import safe from '../react/safe.js'
let BORDER_RADIUS = [
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
]

export let enter = (node, parent, state) => {
  if (node.backgroundImage) {
    let source = getObjectAsString({ uri: node.backgroundImage })

    let resizeMode = getProp(node, 'backgroundSize')
    resizeMode = safe(resizeMode ? resizeMode.value.value : 'cover')

    state.render.push(` resizeMode=${resizeMode} source={${source}}`)

    // hack until https://github.com/facebook/react-native/issues/8885
    // is fixed
    BORDER_RADIUS.forEach(prop => {
      if (hasProp(node, prop)) {
        let propNode = getProp(node, prop)
        state.render.push(` ${prop}={${propNode.value.value}}`)
      }
    })
  }
}
