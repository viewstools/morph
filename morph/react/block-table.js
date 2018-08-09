import { isTable } from '../utils.js'

export function enter(node, parent, state) {
  if (!isTable(node)) return

  state.render.push('{size => (<React.Fragment>')
}

export function leave(node, parent, state) {
  if (!isTable(node)) return

  state.render.push('</React.Fragment>)}')
}
