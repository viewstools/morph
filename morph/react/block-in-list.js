import { getProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (isList(parent)) {
    state.render.push(' index={index} {...item}')

    if (!parent.nameFinal.includes('FlatList')) {
      let key = getProp(node, 'key')
      key = key ? key.value : 'index'

      state.render.push(` key={${key}}`)
    }
  }
}
