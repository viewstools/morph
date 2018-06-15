import { getProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (isList(node)) {
    const from = getProp(node, 'from')
    if (!from) return

    if (node.nameFinal.includes('FlatList')) {
      state.render.push(
        `data={${
          from.value
        }} keyExtractor={(item, index) => item.id || index} renderItem={({ item, index }) =>`
      )
    } else {
      state.render.push(
        `{Array.isArray(${from.value}) && ${from.value}.map((item, index) => `
      )
    }
  }
}

export function leave(node, parent, state) {
  if (isList(node)) {
    state.render.push(node.nameFinal.includes('FlatList') ? '}' : ')}')
  }
}
