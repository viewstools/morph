export function enter(node, state) {
  if (!node.hasTimingAnimation) return

  const timingScopes = node.scopes.map(
    scope =>
      scope.properties.some(
        prop => prop.animation && prop.animation.curve === 'linear'
      ) && scope
  )

  debugger

  state.render.push(
    ` onTransitionEnd={() => {
      if (props.onAnimationDone) {
        ${timingScopes
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
