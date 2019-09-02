import { getProp, isList, isStory } from '../utils.js'

export function enter(node, parent, state) {
  if (node.isFragment && node.children.length === 0) return

  // onWhen lets you show/hide blocks depending on props
  let onWhen = getProp(node, 'onWhen')

  if (onWhen) {
    node.onWhen = true

    if (parent && !isList(parent)) state.render.push('{')
    let value = onWhen.value
    if (state.data && value === 'props.isInvalid') {
      value = 'data.isInvalid'
    } else if (state.data && value === 'props.isValid') {
      value = 'data.isValid'
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
