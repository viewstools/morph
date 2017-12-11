import { getScopedProps } from '../utils.js'
import safe from '../react/safe.js'
import toCamelCase from 'to-camel-case'

const isUrl = str => /^https?:\/\//.test(str)

const getImageSource = (node, state) => {
  const { value } = node.value

  if (isUrl(value)) {
    return `{{ uri: "${value}" }}`
  } else if (node.tags.code) {
    return `{/^https?:\\/\\//.test(${value})? { uri: ${value} } : ${state.debug
      ? 'require'
      : 'requireImage'}(${value})}`
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
      // TODO support scoped source
      // TODO SVGs will need a different treatment when the source is a prop
      if (key === 'source' && parent.parent.name.value === 'Image') {
        return (
          !parent.parent.isSvg && {
            source: getImageSource(node, state),
          }
        )
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
