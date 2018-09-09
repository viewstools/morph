import { getTimingScopes } from '../utils.js'

export function enter(node, parent, state) {
  if (!node.hasTimingAnimation) return

  state.render.push(
    ` onTransitionEnd={() => {
      if (props.onAnimationDone) {
        ${getTimingScopes(node)
          .map(
            scope =>
              `props.onAnimationDone({
            scope: '${scope.slotName}',
            props: [${scope.properties
              .map(
                prop =>
                  prop.name !== 'when' &&
                  prop.animation &&
                  prop.animation.curve !== 'spring' &&
                  JSON.stringify(prop.name)
              )
              .filter(Boolean)
              .join(',')}],
          })`
          )
          .join(';')}
      }
    }}`
  )
}
