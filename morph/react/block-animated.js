import { getProp, isTable } from '../utils.js'

export function enter(node, parent, state) {
  if (!node.hasTimingAnimation) return

  const timingScopes = node.scopes.map(scope => {
    scope.properties.some(
      prop => prop.animation && prop.animation.curve === 'linear'
    )
    return scope.slotName
  })

  debugger

  state.render.push(
    ` onTransitionEnd={() => {
      if (props.onAnimationDone) {
        props.onAnimationDone({
          scope: ${timingScopes.map(scope => `'${scope}'`).join(',')}
        })
      }
    }}`
  )
}
