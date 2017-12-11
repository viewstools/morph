import { getScope, getScopedProps } from '../utils.js'
import safe from '../react/safe.js'
import toCamelCase from 'to-camel-case'

const isUrl = str => /^https?:\/\//.test(str)

const getImageSource = (node, state) => {
  const { value } = node.value

  if (isUrl(value)) {
    return safe(value)
  } else if (node.tags.code) {
    return `{${state.debug ? 'require' : 'requireImage'}(${value})}`
  } else {
    const name = toCamelCase(value)
    if (!state.images.includes(value)) {
      state.images.push({
        name,
        file: value,
      })
    }
    return `{${name}}`
  }
}

export default (node, parent, state) => {
  const key = node.key.value
  const value = node.value.value

  switch (node.value.type) {
    case 'Literal':
      // TODO support sccoped source
      if (key === 'source' && parent.parent.name.value === 'Image') {
        return {
          src: getImageSource(node, state),
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
          [key]: safe(getScopedProps(node, parent.parent)),
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
