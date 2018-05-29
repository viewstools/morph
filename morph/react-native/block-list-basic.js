import { getProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (isList(node) && node.nameFinal !== 'FlatList') {
    const from = getProp(node, 'from')
    if (!from) return

    state.render.push(
      `{Array.isArray(${from.value}) && ${from.value}.map((item, index) => `
    )
  }
}

export function leave(node, parent, state) {
  debugger
  if (isList(node) && node.nameFinal !== 'FlatList') {
    state.render.push(')}')
  }
}
