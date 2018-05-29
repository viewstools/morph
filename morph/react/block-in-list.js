import { isList } from '../utils.js'

export function enter(node, parent, state) {
  if (isList(parent)) {
    state.render.push(' index={index} {...item}')

    if (parent.nameFinal !== 'FlatList') {
      state.render.push(` key={item.id || index}`)
    }
  }
}
