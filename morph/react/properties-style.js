import { checkParentStem, isSlot } from '../utils.js'
import safe from './safe.js'

export function enter(node, parent, state) {
  node.style = {
    dynamic: {
      base: {},
      hover: {},
      focus: {},
      disabled: {},
      placeholder: {},
      print: {},
    },
    static: {
      base: {},
      hover: {},
      focus: {},
      disabled: {},
      placeholder: {},
      print: {},
    },
  }

  // TODO use this directly in styles without having to go through this
  node.scopes.filter(scope => scope.isSystem).forEach(scope => {
    scope.properties.forEach(propNode => {
      if (propNode.name === 'when' || propNode.tags.hasOwnProperty('rowStyle'))
        return

      const { _isProp, ...styleForProperty } = state.getStyleForProperty(
        propNode,
        node,
        isSlot(propNode)
      )

      if (_isProp) {
        Object.keys(styleForProperty).forEach(k =>
          state.render.push(` ${k}=${safe(styleForProperty[k], node)}`)
        )
      } else {
        const hasMatchingParent =
          parent && node.isDynamic ? checkParentStem(node, scope.value) : false
        const target =
          isSlot(propNode) || hasMatchingParent
            ? node.style.dynamic
            : node.style.static
        Object.assign(target[scope.value], styleForProperty)
      }
    })
  })

  // ensure flex-direction in Horizontals
  if (node.isGroup && node.name === 'Horizontal') {
    node.style.static.base.flexDirection = 'row'
  }
}
