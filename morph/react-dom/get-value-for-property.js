import { isCode } from '../utils.js'
import wrap from '../react/wrap.js'

export default (node, parent) => {
  const key = node.key.value
  const value = node.value.value

  switch (node.value.type) {
    case 'Literal':
      return {
        [key]: typeof value === 'string' && !isCode(node)
          ? JSON.stringify(value)
          : wrap(value),
      }
    // TODO lists
    case 'ArrayExpression':
    // TODO support object nesting
    case 'ObjectExpression':
    default:
      return false
  }
}
