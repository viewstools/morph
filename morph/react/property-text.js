import { getScopedCondition, hasCustomScopes, isSlot } from '../utils.js'
import wrap from './wrap.js'

let HAS_RESTRICTED_CHARACTERS = /[{}<>/]/

export function enter(node, parent, state) {
  if (node.name === 'text' && parent.name === 'Text') {
    if (state.data && node.value === 'props.value') {
      parent.explicitChildren = '{data.value}'
    } else if (hasCustomScopes(node, parent)) {
      parent.explicitChildren = wrap(getScopedCondition(node, parent, state))
    } else if (isSlot(node)) {
      parent.explicitChildren = wrap(node.value)
    } else if (HAS_RESTRICTED_CHARACTERS.test(node.value)) {
      parent.explicitChildren = `{"${node.value}"}`
    } else {
      parent.explicitChildren = node.value
    }

    return true
  }
}
