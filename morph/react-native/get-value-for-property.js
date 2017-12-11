import { isCode, getScopedProps } from '../utils.js'
import safe from '../react/safe.js'
import toCamelCase from 'to-camel-case'

const isUrl = str => /^https?:\/\//.test(str)

const getImageSource = (node, state) => {
  const { value } = node.value

  if (node.tags.code || isUrl(value)) {
    const uri = isCode(value) ? value : `"${value}"`
    return `{{ uri: ${uri}}}`
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
      // TODO support local files passed as props
      // I guess we either do this dynamically or we determine the value being
      // passed based off the link between views
      if (key === 'source' && parent.parent.name.value === 'Image') {
        return {
          source: getImageSource(node, state),
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
