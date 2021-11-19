import {
  getActionableParent,
  getFlowPath,
  getProp,
  getScopedCondition,
  getScopedImageCondition,
  getScopes,
  getDataForLoc,
  hasCustomBlockParent,
  isValidImgSrc,
  pushImageToState,
  replacePropWithDataValue,
} from '../utils.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'
import toCamelCase from 'to-camel-case'

let isUrl = (str) => /^https?:\/\//.test(str)

function getImageSource(node, parent, state) {
  let scopes = getScopes(node, parent, state)

  if (scopes && (isUrl(node.value) || node.tags.slot)) {
    return `{{ uri: ${getScopedCondition(node, parent, state)} }}`
  } else if (isUrl(node.value) || node.tags.slot) {
    if (node.defaultValue && !isUrl(node.defaultValue)) {
      state.slots.forEach((item) => {
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

let DATA_VALUES = /!?props\.(isInvalid|isInvalidInitial|isValid|isValidInitial|isSubmitting|value|onSubmit|onChange)$/
let CHILD_VALUES = /props\.(isSelected|isHovered|isFocused|isSelectedHovered)/
let ON_IS_SELECTED = /(onClick|onPress|goTo)/
let ON_IS_FOCUSED = /(onFocus|onBlur)/

export default function getValueForProperty(node, parent, state) {
  let data = getDataForLoc(parent, node.loc)
  if (data && DATA_VALUES.test(node.value)) {
    return {
      [node.name]: `{${replacePropWithDataValue(node.value, data)}}`,
    }
  } else if (/!?props\.(isFlow|flow)$/.test(node.value)) {
    let flowPath = getFlowPath(node, parent, state)
    state.use('ViewsUseFlow')
    state.useFlowHas = true

    return {
      [node.name]: `{${node.value.replace(
        /props\.(isFlow|flow)/,
        `flow.has(${flowPath})`
      )}}`,
    }
  } else if (hasCustomBlockParent(parent) && CHILD_VALUES.test(node.value)) {
    return {
      [node.name]: `{${node.value.replace('props.', 'childProps.')}}`,
    }
  } else if (isValidImgSrc(node, parent)) {
    return (
      !parent.isSvg && {
        source: getImageSource(node, parent, state),
      }
    )
  } else if (getScopedCondition(node, parent, state)) {
    return {
      [node.name]: safe(getScopedCondition(node, parent, state)),
    }
  } else if (/^on[A-Z]/.test(node.name) && node.slotName === 'setFlowTo') {
    let flowPath = getFlowPath(node, parent, state)
    state.use('ViewsUseFlow')
    state.setFlowTo = true

    let ret = {
      [node.name]: `{() => setFlowTo(${flowPath})}`,
    }

    if (!parent.isBasic && ON_IS_SELECTED.test(node.name)) {
      state.useFlowHas = true
      ret[
        node.name.replace(ON_IS_SELECTED, 'isSelected')
      ] = `{flow.has(${flowPath})}`
    }

    if (parent.isBasic && ON_IS_SELECTED.test(node.name)) {
      state.useIsHovered = true
      ret['...'] = `${node.name.replace(ON_IS_SELECTED, 'isHovered')}Bind`
    }

    return ret
  } else if (parent.isBasic && ON_IS_SELECTED.test(node.name)) {
    state.useIsHovered = true
    return {
      '...': `${node.name.replace(ON_IS_SELECTED, 'isHovered')}Bind`,
      [node.name]: safe(node.value, node),
    }
  } else if (
    CHILD_VALUES.test(node.value) &&
    !!getActionableParent(parent) &&
    !parent.isBasic
  ) {
    // TODO support more than one hover/selected in the same block - let's wait
    // for a use case
    if (/isHovered/.test(node.value)) {
      return {
        [node.name]: safe(node.value.replace('props.', ''), node),
      }
    } else if (/isSelected/.test(node.value)) {
      try {
        let actionableParent = getActionableParent(parent)
        let flowPath = getFlowPath(
          getProp(actionableParent, 'onClick'),
          actionableParent,
          state
        )
        state.use('ViewsUseFlow')
        state.useFlowHas = true
        return {
          [node.name]: `{flow.has(${flowPath})}`,
        }
      } catch (error) {
        return {
          [node.name]: safe(node.value, node),
        }
      }
    } else {
      return {
        [node.name]: safe(node.value, node),
      }
    }
  } else if (
    ['Capture', 'CaptureTextArea'].includes(parent.name) &&
    node.name === 'onChange'
  ) {
    // adding the value as a second argument to onChange as the event received if different on React DOM from React Native
    return {
      [node.name]: safe(
        `(e) => ${node.value} && ${node.value}(e, e.nativeEvent.text)`,
        node
      ),
    }
  } else if (parent.isBasic && ON_IS_FOCUSED.test(node.name)) {
    state.useIsFocused = true
    return {
      [node.name]: safe(`${node.value.replace('props.', '')}Bind`, node),
    }
  } else {
    return {
      [node.name]: safe(node.value, node),
    }
  }
}
