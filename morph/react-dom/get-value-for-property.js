import {
  getProp,
  getScopedCondition,
  getScopedImageCondition,
  getScopes,
  hasProp,
  isValidImgSrc,
  makeOnClickTracker,
  pushImageToState,
} from '../utils.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'
import toCamelCase from 'to-camel-case'

let isUrl = str => /^https?:\/\//.test(str)

let getImageSource = (node, state, parent) => {
  let scopes = getScopes(node, parent)

  if (scopes && (isUrl(node.value) || node.tags.slot)) {
    return wrap(getScopedCondition(node, parent))
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
    return safe(node.value)
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
  } else if (node.name === 'onClick') {
    let onClick = safe(node.value, node)

    if (node.slotName === 'setFlow') {
      if (hasProp(parent, 'onClickId')) {
        onClick = `{() => setFlow("${getProp(parent, 'onClickId').value}")}`
        state.use('ViewsUseFlow')
        state.setFlow = true
        // TODO warn if action is used but it isn't in actions (on parser)
      } else {
        // TODO warn that there's setFlow without an id (on parser)
      }
    } else if (state.track) {
      // TODO merge flow with track
      onClick = wrap(makeOnClickTracker(node, parent, state))
    }

    return { onClick }
  } else {
    return {
      [node.name]: safe(node.value, node),
    }
  }
}
