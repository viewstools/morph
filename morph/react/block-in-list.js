import { getProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (isList(parent)) {
    state.render.push(` index={index}`)

    let pass = getProp(parent, 'pass')
    if (pass) {
      state.render.push(` ${pass.value}={${pass.value}}`)
    } else {
      state.render.push(' {...item}')
    }

    if (!parent.nameFinal.includes('FlatList')) {
      let key = getProp(node, 'key')
      key = key ? key.value : 'index'

      state.render.push(` key={${key}}`)
    }
  }
}
