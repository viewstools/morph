import { getProp } from '../utils.js'

export function enter(node, parent, state) {
  if (node.name !== 'View' || !state.flow) return

  let prop = getProp(node, 'profile')
  if (!prop) return

  state.profile = prop.value

  state.use('ViewsUseProfile')
}
