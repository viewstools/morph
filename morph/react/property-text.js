import { getScopedProps, isCode } from '../utils.js'
import wrap from './wrap.js'

export function enter(node, parent, state) {
  if (node.name === 'text' && parent.name === 'Text') {
    if (getScopedProps(node, parent)) {
      parent.explicitChildren = wrap(getScopedProps(node, parent))
    } else {
      parent.explicitChildren = isCode(node) ? wrap(node.value) : node.value
    }

    return true
  }
}
