import {
  getFlowPath,
  getProp,
  getDataForLoc,
  replacePropWithDataValue,
  hasCustomBlockParent,
  isList,
  isViewSeparate,
} from '../utils.js'

let IS_MEDIA = /(!?props\.isMedia)(.+)/
let DATA_VALUES = /!?props\.(isInvalid|isInvalidInitial|isValid|isValidInitial|isSubmitting|value)$/
let CHILD_VALUES = /!?props\.(isSelected|isHovered|isFocused)/
let IS_HOVERED = /!?props\.(isHovered|isSelectedHovered)/
let IS_FLOW = /!?props\.(isFlow|flow)$/

export function enter(node, parent, state) {
  if (node.isFragment && node.children.length === 0) return

  // onWhen lets you show/hide blocks depending on props
  let onWhen = getProp(node, 'onWhen')

  if (onWhen) {
    node.onWhen = true

    if (parent && !isList(parent)) state.render.push('{')

    let value = onWhen.value
    let data = getDataForLoc(node, onWhen.loc)
    if (data && DATA_VALUES.test(value)) {
      value = replacePropWithDataValue(value, data)
    } else if (IS_MEDIA.test(value)) {
      let [, variable, media] = value.match(IS_MEDIA)
      value = `${variable.replace('props.', '')}.${media.toLowerCase()}`
    } else if (hasCustomBlockParent(node) && CHILD_VALUES.test(value)) {
      value = value.replace('props.', 'childProps.')
    } else if (IS_FLOW.test(value)) {
      let flowPath = getFlowPath(onWhen, node, state)
      state.useFlowHas = true
      value = value.replace('props.flow', `flow.has(${flowPath})`)
    } else if (IS_HOVERED.test(value)) {
      value = value.replace('props.', '')
    }

    state.render.push(`${value} ? `)
  } else if (isViewSeparate(node, state)) {
    node.onWhen = true
    state.useFlowValue = true
    if (state.flowDefaultState === null) {
      state.flowDefaultState = node.name
    }
    state.render.push(`{flowValue === '${node.name}' ? `)
  }
}

export function leave(node, parent, state) {
  if (node.onWhen) {
    state.render.push(` : null`)
    if (parent && !isList(parent)) state.render.push('}')
  }
}
