import { getProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (isList(node)) {
    const from = getProp(node, 'from')
    if (!from) return

    if (node.nameFinal == 'FlatList') {
      state.render.push(`data={${from.value}} renderItem={({ item }) =>`)
    } else {
      state.render.push(
        `{Array.isArray(${from.value}) && ${from.value}.map((item, index) => `
      )
    }
  }
}

export function leave(node, parent, state) {
  debugger
  if (isList(node)) {
    if (node.nameFinal == 'FlatList') {
      state.render.push('}')
    } else {
      state.render.push(')}')
    }
  }
}
