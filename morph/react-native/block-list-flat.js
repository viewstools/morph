import { getProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (node.nameFinal === 'FlatList') {
    const from = getProp(node, 'from')
    if (!from) return
    debugger

    state.render.push(`data={${from.value}} renderItem={({ item }) =>`)
  }
}

export function leave(node, parent, state) {
  if (node.nameFinal === 'FlatList') {
    state.render.push('}')
  }
}
