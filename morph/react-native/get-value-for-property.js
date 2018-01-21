import { getScopedCondition, isScopedImgSrc, isValidImgSrc } from '../utils.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'
import toCamelCase from 'to-camel-case'

const isUrl = str => /^https?:\/\//.test(str)

const getImageSource = (node, state) => {
  if (isUrl(node.value) || node.tags.code) {
    return `{{ uri: ${node.tags.code ? node.value : safe(node.value)} }}`
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
  // TODO SVGs will need a different treatment when the source is a prop
  debugger
  // if (isScopedImgSrc(node, parent)) {
  //   return (
  //     !parent.isSvg && {
  //       source: wrap(getScopedCondition(node, parent))
  //     }
  //   )
  // } else
  if (isValidImgSrc(node, parent)) {
    return (
      !parent.isSvg && {
        source: getImageSource(node, state),
      }
    )
  } else if (getScopedCondition(node, parent)) {
    return {
      [node.name]: safe(getScopedCondition(node, parent)),
    }
  } else {
    return {
      [node.name]: safe(node.value, node),
    }
  }
}
