// import { canUseNativeDriver } from '../utils.js'
import { getSpringScopes } from '../utils.js'
import getUnit from '../get-unit.js'
// import toPascalCase from 'to-pascal-case'

export default ({ state, name }) => {
  debugger
  let render = state.render.join('')
  if (Object.keys(state.locals).length > 0 || state.isFormatted) {
    render = `<Subscribe to={[LocalContainer]}>\n{local =>\n${render}\n}</Subscribe>`
  }

  const maybeChildrenArray = state.usesChildrenArray
    ? `const childrenArray = React.Children.toArray(props.children)`
    : ''

  let maybeAnimated = false
  let animatedOpen = []
  let animatedClose = []
  if (state.isAnimated) {
    maybeAnimated = true

    Object.keys(state.animations).forEach(blockId => {
      debugger
      Object.values(state.animations[blockId]).forEach(item => {
        const { curve, ...configValues } = item.animation.properties
        deugger

        if (!state.isReactNative && curve !== 'spring') return

        const tag = curve === 'spring' ? 'Spring' : 'Timing'
        let config = Object.entries(configValues)
          .map(([key, value]) => `${key}={${value}}`)
          .join(' ')

        if (curve !== 'spring') {
          config = `curve="${curve}" ${config}`
        }

        const to = Object.values(item.props)
          .map(prop => {
            prop.scopes.reverse()

            let value = prop.scopes.reduce(
              (current, scope) =>
                `props.${scope.name}? ${JSON.stringify(
                  scope.value
                )} : ${current}`,
              JSON.stringify(prop.value)
            )

            const unit = getUnit(prop)
            if (!state.isReactNative && unit) {
              value = `\`$\{${value}}${unit}\``
            }

            return `${JSON.stringify(prop.name)}: ${value}`
          })
          .join(',')

        // TODO bring back native driver when possible in RN
        // there's an issue with animated(View) in react-spring's
        // implementation that is preventing us from using it,
        // it doesn't seem to recognise regular styles, so we
        // have to use RN's Animated the thing is that the native flag on
        // react-spring breaks things, I imagine it's because it's a different
        // implementation altogether, so we'll see it at some later stage.
        const useNativeDriver = state.isReactNative
          ? false // !Object.keys(item.props).some(canUseNativeDriver)
          : true
        animatedOpen.push(
          `<${tag} ${useNativeDriver ? 'native' : ''} ${config} to={{${to}}}
          onRest={() => {
            ${getSpringScopes(state)
              .map(
                scope =>
                  `props.onAnimationDone({
                scope: '${scope.slotName}',
                props: [${scope.properties
                  .map(
                    prop =>
                      prop.name !== 'when' &&
                      prop.animation.curve === 'spring' &&
                      `'${prop.name}'`
                  )
                  .filter(Boolean)
                  .join(',')}],
              })`
              )
              .join(';')}
          }}>{animated${blockId}${item.index > 0 ? item.index : ''} => (`
        )

        debugger

        animatedClose.push(`)}</${tag}>`)
      })
    })
  }

  if (state.hasRefs || state.track || maybeAnimated) {
    return `class ${name} extends React.Component {
  render() {
    const { ${state.track ? 'context,' : ''} props } = this
    ${maybeChildrenArray}
    return (${animatedOpen.join('')}${render}${animatedClose
      .reverse()
      .join('')})
  }
}`
  } else {
    return `const ${name} = (props ${state.track ? ', context' : ''}) => {
  ${maybeChildrenArray}
  return (${render})
}`
  }
}
