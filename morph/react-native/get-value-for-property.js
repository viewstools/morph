import {
  getScopedCondition,
  getScopedImageCondition,
  getScopes,
  isValidImgSrc,
  pushImageToState,
} from '../utils.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'
import toCamelCase from 'to-camel-case'

const isUrl = str => /^https?:\/\//.test(str)

const getImageSource = (node, state, parent) => {
  const scopes = getScopes(node, parent)

  if (scopes && (isUrl(node.value) || node.tags.code)) {
    return `{{ uri: ${getScopedCondition(node, parent)} }}`
  } else if (isUrl(node.value) || node.tags.code) {
    return `{{ uri: ${node.tags.code ? node.value : safe(node.value)} }}`
  } else {
    if (scopes) {
      pushImageToState(state, scopes.scopedNames, scopes.paths)
    }
    const name = toCamelCase(node.value)
    if (!state.images.includes(node.value)) {
      state.images.push({
        name,
        file: node.value,
      })
    }

    return scopes
      ? wrap(
          getScopedImageCondition(scopes.scopedProps, scopes.scopedNames, name)
        )
      : `{${name}}`
  }
}

export default (node, parent, state) => {
  if (isValidImgSrc(node, parent)) {
    return (
      !parent.isSvg && {
        source: getImageSource(node, state, parent),
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
