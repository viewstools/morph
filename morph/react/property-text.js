import {
  getLocals,
  getScopedCondition,
  hasCustomScopes,
  hasLocals,
  isSlot,
} from '../utils.js'
import safe from './safe.js'
import wrap from './wrap.js'

export function enter(node, parent, state) {
  if (node.name === 'text' && parent.name === 'Text') {
    if (hasCustomScopes(node, parent)) {
      parent.explicitChildren = wrap(getScopedCondition(node, parent))
    } else if (isSlot(node)) {
      parent.explicitChildren = wrap(node.value)
    } else if (hasLocals(node, parent)) {
      const baseLocalName = `${parent.is || parent.name}Local`
      let localName = baseLocalName
      let index = 1
      while (localName in state.locals) {
        localName = `${baseLocalName}${index++}`
      }

      state.locals[localName] = getLocals(node, parent, state)
      parent.explicitChildren = wrap(
        `${localName}[local.state.lang] || ${safe(node.value)}`
      )
    } else {
      parent.explicitChildren = node.value
    }

    return true
  }
}
