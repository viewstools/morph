import {
  getScopedCondition,
  getScopedImageCondition,
  getScopedRequireCondition,
  getScopedProps,
  isValidImgSrc,
  pushImageToState,
} from '../utils.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'
import toCamelCase from 'to-camel-case'

const isUrl = str => /^https?:\/\//.test(str)

const getImageSource = (node, state, parent) => {
  debugger
  let scopes
  let paths
  let scopedNames
  if (!!getScopedProps(node, parent) && (isUrl(node.value) || node.tags.code)) {
    return wrap(getScopedCondition(node, parent))
  } else if (isUrl(node.value) || node.tags.code) {
    return safe(node.value)
  } else {
    if (!!getScopedProps(node, parent)) {
      scopes = getScopedProps(node, parent)
      paths = scopes.map(scope => scope.prop.value)
      scopedNames = paths.map(path => toCamelCase(path))

      pushImageToState(state, scopedNames, paths)
    }

    if (!!getScopedProps(node, parent) && state.debug) {
      return wrap(getScopedRequireCondition(scopes, paths, node.value))
    } else if (state.debug) {
      return `{requireImage("${node.value}")}`
    } else {
      const defaultName = toCamelCase(node.value)
      if (!state.images.includes(node.value)) {
        state.images.push({
          name: defaultName,
          file: node.value,
        })
      }
      return !!getScopedProps(node, parent)
        ? wrap(getScopedImageCondition(scopes, scopedNames, defaultName))
        : `{${defaultName}}`
    }
  }
}

export default (node, parent, state) => {
  debugger
  if (isValidImgSrc(node, parent)) {
    return {
      src: getImageSource(node, state, parent),
    }
  } else if (parent.isBasic && node.name === 'isDisabled') {
    return {
      disabled: safe(node.value, node),
    }
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
