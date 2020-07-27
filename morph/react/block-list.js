import { getProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (isList(node)) {
    let from = getProp(node, 'from')
    if (!from) return

    let pass = getProp(node, 'pass')
    let itemName = pass ? pass.value : 'item'

    state.render.push(
      `{Array.isArray(${from.value}) && ${from.value}.map((${itemName}, index) => `
    )
  }
}

export function leave(node, parent, state) {
  if (isList(node)) {
    state.render.push(')}')
  }
}
