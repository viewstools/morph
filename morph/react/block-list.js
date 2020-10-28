import { getProp, isList } from '../utils.js'

let DATA_VALUE = /props\.value/

export function enter(node, parent, state) {
  if (!isList(node)) return

  let from = getProp(node, 'from')
  if (!from) return

  let pass = getProp(node, 'pass')
  let itemName = 'item'

  let value = from.value
  if (state.data && DATA_VALUE.test(value)) {
    value = value.replace('props', 'data')
    itemName = 'item'
  } else if (pass) {
    itemName = pass.value
  }

  state.render.push(
    `{Array.isArray(${value}) && ${value}.map((${itemName}, index, list) => `
  )
}

export function leave(node, parent, state) {
  if (!isList(node)) return

  state.render.push(')}')
}
