import { getProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (isList(node)) {
    const from = getProp(node, 'from')
    if (!from) return
    debugger

    state.render.push(
      `data={${from.value}} renderItem={({ item }) => <${
        node.children[0].name
      } {...item} />}`
    )

    // state.render.push(
    //   `{Array.isArray(${from.value}) && ${from.value}.map((item, index) => `
    // )
  }
}

export function leave(node, parent, state) {
  if (isList(node)) {
    state.render.push(')}')
  }
}
