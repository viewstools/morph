import { getScope, getScopedProps, isCode } from '../utils.js'
import safe from '../react/safe.js'

export default (node, parent) => {
  const key = node.key.value
  const value = node.value.value

  switch (node.value.type) {
    case 'Literal':
      if (key === 'source' && parent.parent.name.value === 'Image') {
        return {
          src: safe(value, node),
        }
      } else if (
        key === 'isDisabled' &&
        value.toString().indexOf('when') > -1
      ) {
        return {
          disabled: safe(getScope(node)),
        }
      } else if (parent.parent.scoped.hasOwnProperty(key)) {
        return {
          [key]: safe(getScopedProps(parent.parent, key)),
        }
      } else {
        return {
          [key]: safe(value, node),
        }
      }
    // TODO lists
    case 'ArrayExpression':
    // TODO support object nesting
    case 'ObjectExpression':
    default:
      return false
  }
}
