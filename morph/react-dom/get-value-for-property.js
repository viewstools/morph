import { getScopedProps } from '../utils.js'
import safe from '../react/safe.js'
import toCamelCase from 'to-camel-case'

const isUrl = str => /^https?:\/\//.test(str)

const getImageSource = (node, state) => {
  if (isUrl(node.value) || node.tags.code) {
    return safe(node.value)
  } else {
    if (state.debug) {
      return `{requireImage("${node.value}")}`
    } else {
      const name = toCamelCase(node.value)
      if (!state.images.includes(node.value)) {
        state.images.push({
          name,
          file: node.value,
        })
      }
      return `{${name}}`
    }
  }
}

export default (node, parent, state) => {
  // TODO support scoped source
  if (node.name === 'source' && parent.name === 'Image' && parent.isBasic) {
    return {
      src: getImageSource(node, state),
    }
  } else if (parent.isBasic && node.name === 'isDisabled') {
    return {
      disabled: safe(node.value, node),
    }
  } else if (getScopedProps(node, parent)) {
    return {
      [node.name]: safe(getScopedProps(node, parent)),
    }
  } else {
    return {
      [node.name]: safe(node.value, node),
    }
  }
}
