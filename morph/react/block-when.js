import { isEmpty, isList, last } from '../utils.js'

export function enter(node, parent, state) {
  // when lets you show/hide blocks depending on props
  const when = last(node.scopes)

  if (when && isEmpty(when.properties)) {
    node.when = true

    if (parent && !isList(parent)) state.render.push('{')

    state.render.push(`${when.value} ? `)
  }
}

export function leave(node, parent, state) {
  if (node.when) {
    state.render.push(` : null`)
    if (parent && !isList(parent)) state.render.push('}')
  }
}
