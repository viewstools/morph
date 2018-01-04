import { getScopedProps } from '../utils.js'
import safe from '../react/safe.js'
import toCamelCase from 'to-camel-case'

const isUrl = str => /^https?:\/\//.test(str)

const getImageSource = (node, state) => {
  if (isUrl(node.value)) {
    return `{{ uri: "${node.value}" }}`
  } else if (node.tags.code) {
    return `{/^https?:\\/\\//.test(${node.value})? { uri: ${node.value} } : ${
      state.debug ? 'requireImage' : 'require'
    }(${node.value})}`
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

export default (node, parent, state) => {
  // TODO support scoped source
  // TODO SVGs will need a different treatment when the source is a prop
  if (node.name === 'source' && parent.name === 'Image') {
    return (
      !parent.isSvg && {
        source: getImageSource(node, state),
      }
    )
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
