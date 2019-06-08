import {
  getProp,
  getScopedCondition,
  getScopedImageCondition,
  getScopes,
  hasProp,
  isValidImgSrc,
  pushImageToState,
} from '../utils.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'
import toCamelCase from 'to-camel-case'

let isUrl = str => /^https?:\/\//.test(str)

let getImageSource = (node, state, parent) => {
  let scopes = getScopes(node, parent)

  if (scopes && (isUrl(node.value) || node.tags.slot)) {
    return `{{ uri: ${getScopedCondition(node, parent)} }}`
  } else if (isUrl(node.value) || node.tags.slot) {
    if (node.defaultValue && !isUrl(node.defaultValue)) {
      state.slots.forEach(item => {
        if (item.defaultValue === node.defaultValue) {
          item.type = 'import'
          let name = toCamelCase(item.defaultValue)
          if (!state.images.includes(item.defaultValue)) {
            state.images.push({
              name,
              file: item.defaultValue,
            })
          }
          item.defaultValue = name
        }
      })
    }
    return `{{ uri: ${node.tags.slot ? node.value : safe(node.value)} }}`
  } else {
    if (scopes) {
      pushImageToState(state, scopes.scopedNames, scopes.paths)
    }
    let name = toCamelCase(node.value)
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
  } else if (node.name === 'onClick') {
    if (parent.action) return false

    let onClick = safe(node.value, node)

    if (node.slotName === 'flowSetState' && hasProp(parent, 'onClickId')) {
      let parts = getProp(parent, 'onClickId').value.split('/')
      let key = parts[parts.length - 2]
      let value = parts[parts.length - 1]
      onClick = `{() => flowSetState("${key}", "${value}")}`
      state.use('ViewsUseFlow')
      state.flowSetState = true
      // TODO warn if action is used but it isn't in actions (on parser)
      // TODO warn that there's flowSetState without an id (on parser)
    }

    return { onClick }
  } else {
    return {
      [node.name]: safe(node.value, node),
    }
  }
}
