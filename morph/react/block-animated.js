import { getProp } from '../utils.js'
import { getTimingScopes } from '../utils.js'

export function enter(node, parent, state) {
  if (!node.hasTimingAnimation) return

  debugger

  state.render.push(
    ` onTransitionEnd={() => {
      if (props.onAnimationDone) {
        ${getTimingScopes(node)
          .map(
            scope =>
              `props.onAnimationDone({
            scope: '${scope.slotName}',
            props: [${scope.properties
              .map(prop => prop.name !== 'when' && `'${prop.name}'`)
              .filter(Boolean)
              .join(',')}],
          })`
          )
          .join(';')}
      }
    }}`
  )
}
