import {
  getScopedCondition,
  getScopedImageCondition,
  getScopes,
  isValidImgSrc,
  pushImageToState,
} from '../utils.js'
import path from 'path'
import safe from '../react/safe.js'
import toCamelCase from 'to-camel-case'
import wrap from '../react/wrap.js'

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
  if (
    state.data &&
    (node.value === 'props.value' ||
      node.value === 'props.onSubmit' ||
      node.value === 'props.onChange' ||
      node.value === 'props.isInvalid' ||
      node.value === 'props.isInvalidInitial' ||
      node.value === 'props.isValid' ||
      node.value === 'props.isValidInitial' ||
      node.value === 'props.onSubmit')
  ) {
    return {
      [node.name]: `{${node.value.replace('props.', 'data.')}}`,
    }
  } else if (isValidImgSrc(node, parent)) {
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
  } else if (/^on[A-Z]/.test(node.name) && node.slotName === 'setFlowTo') {
    // TODO warn if action is used but it isn't in actions (on parser)
    // TODO warn that there's setFlowTo without an id (on parser)
    let setFlowTo = node.defaultValue
    if (!setFlowTo.startsWith('/')) {
      setFlowTo = path.normalize(path.join(state.pathToStory, setFlowTo))
    }
    state.use('ViewsUseFlow')
    state.setFlowTo = true

    let ret = {
      [node.name]: `{() => setFlowTo('${setFlowTo}')}`,
    }

    if (!parent.isBasic && ON_IS_SELECTED.test(node.name)) {
      state.useFlow = true
      ret[
        node.name.replace(ON_IS_SELECTED, 'isSelected')
      ] = `{flow.has('${setFlowTo}')}`
    }

    return ret
  } else {
    return {
      [node.name]: safe(node.value, node),
    }
  }
}

let ON_IS_SELECTED = /(onClick|onPress)/
