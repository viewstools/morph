import { getProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (isList(node)) {
    const from = getProp(node, 'from')
    if (!from) return

    state.render.push(
      `{Array.isArray(${from.value}) && ${from.value}.map((item, index) => `
    )
  }
}

export function leave(node, parent, state) {
  if (isList(node)) {
    state.render.push(')}')
  }
}
