import { asScopedValue, isCode } from '../utils.js'
import wrap from './wrap.js'

export function enter(node, parent, state) {
  if (node.name === 'text' && parent.name === 'Text') {
    if (parent.scoped.text) {
      parent.explicitChildren = wrap(
        asScopedValue(parent.scoped.text, node, parent)
      )
    } else {
      parent.explicitChildren = isCode(node) ? wrap(node.value) : node.value
    }

    return true
  }
}
