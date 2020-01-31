import {
  getFlowPath,
  getProp,
  hasCustomBlockParent,
  isList,
  isStory,
} from '../utils.js'

let IS_MEDIA = /(!?props\.isMedia)(.+)/
let DATA_VALUES = /props\.(isInvalid|isInvalidInitial|isValid|isValidInitial|!value|value)/
let CHILD_VALUES = /!?props\.(isSelected|isHovered|isFocused)/
let IS_HOVERED = /!?props\.isHovered/
let IS_FLOW = /!?props\.flow$/

export function enter(node, parent, state) {
  if (node.isFragment && node.children.length === 0) return

  // onWhen lets you show/hide blocks depending on props
  let onWhen = getProp(node, 'onWhen')

  if (onWhen) {
    node.onWhen = true

    if (parent && !isList(parent)) state.render.push('{')

    let value = onWhen.value
    if (state.data && DATA_VALUES.test(value)) {
      value = value.replace('props', 'data')
    } else if (IS_MEDIA.test(value)) {
      let [, variable, media] = value.match(IS_MEDIA)
      value = `${variable.replace('props.', '')}.${media.toLowerCase()}`
    } else if (hasCustomBlockParent(node) && CHILD_VALUES.test(value)) {
      value = value.replace('props.', 'childProps.')
    } else if (IS_FLOW.test(value)) {
      let flowPath = getFlowPath(onWhen, node, state)
      value = value.replace('props.flow', `flow.has('${flowPath}')`)
    } else if (IS_HOVERED.test(value)) {
      value = value.replace('props.', '')
    }

    state.render.push(`${value} ? `)
  } else if (isStory(node, state)) {
    node.onWhen = true
    state.render.push(`{flow.has("${state.pathToStory}/${node.name}") ? `)
  }
}

export function leave(node, parent, state) {
  if (node.onWhen) {
    state.render.push(` : null`)
    if (parent && !isList(parent)) state.render.push('}')
  }
}
