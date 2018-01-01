import { isList } from '../utils.js'

export function enter(node, parent, state) {
  if (isList(parent)) {
    state.render.push(' {...item} key={item.id || index}')
  }
}
