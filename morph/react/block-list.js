import { getProp, isList } from '../utils.js'

let DATA_VALUE = /props\.value/

export function enter(node, parent, state) {
  if (isList(node)) {
    let from = getProp(node, 'from')
    if (!from) return

    let pass = getProp(node, 'pass')
    let itemName = pass ? pass.value : 'item'

    let value = from.value
    if (state.data && DATA_VALUE.test(value)) {
      value = value.replace('props', 'data')
    }

    state.render.push(
      `{Array.isArray(${value}) && ${value}.map((${itemName}, index) => `
    )
  }
}

export function leave(node, parent, state) {
  if (isList(node)) {
    state.render.push(')}')
  }
}
