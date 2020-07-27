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

    let key = getProp(node, 'key')
    state.render.push(` key={${key ? key.value : 'index'}}`)
  }
}
