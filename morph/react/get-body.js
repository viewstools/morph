import getUnit from '../get-unit.js'

export default ({ state, name }) => {
  let render = state.render.join('')
  if (Object.keys(state.locals).length > 0 || state.isFormatted) {
    render = `<Subscribe to={[LocalContainer]}>\n{local =>\n${render}\n}</Subscribe>`
  }

  let animatedOpen = []
  let animatedClose = []
  if (state.isAnimated) {
    Object.keys(state.animations).forEach(blockId => {
      Object.values(state.animations[blockId]).forEach(item => {
        let { curve, ...configValues } = item.animation.properties

        if (!state.isReactNative && curve !== 'spring') return

        let config = `config={${JSON.stringify(configValues)}}`

        if (curve !== 'spring' && curve !== 'linear') {
          config = `easing={Easing.${curve.replace(
            'ease',
            'easeCubic'
          )}} ${config}`
        }

        let to = Object.values(item.props)
          .map(prop => {
            prop.scopes.reverse()

            let value = prop.scopes.reduce(
              (current, scope) =>
                `props.${scope.name}? ${JSON.stringify(
                  scope.value
                )} : ${current}`,
              JSON.stringify(prop.value)
            )

            let unit = getUnit(prop)
            if (!state.isReactNative && unit) {
              value = `\`$\{${value}}${unit}\``
            }

            return `${JSON.stringify(prop.name)}: ${value}`
          })
          .join(',')

        animatedOpen.push(
          `<Spring native ${config} to={{${to}}}>{animated${blockId}${
            item.index > 0 ? item.index : ''
          } => (`
        )

        animatedClose.push(`)}</Spring>`)
      })
    })
  }

  let flow = []
  if (state.flow === 'separate' && state.flowDefaultState !== null) {
    flow.push(
      `let flowState = fromFlow.useFlowState("${state.name}", "${
        state.flowDefaultState
      }")`
    )
  }
  if (state.flowSetState) {
    flow.push(`let flowSetState = fromFlow.useFlowSetState()`)
  }

  flow = flow.join('\n')

  if (state.hasRefs || state.isAnimated) {
    animatedOpen = animatedOpen.join('')
    animatedClose = animatedClose.reverse().join('')

    let trackOpen = state.track ? '<TrackContext.Consumer>{track => (' : ''
    let trackClose = state.track ? ')}</TrackContext.Consumer>' : ''
    return `class ${name} extends React.Component {
  render() {
    let { props } = this
    return (${trackOpen}${animatedOpen}${render}${animatedClose}${trackClose})
  }
}`
  } else {
    let ret = render ? `(${render})` : null

    return `let ${name} = (props) => {
    ${state.track ? `let track = React.useContext(TrackContext)` : ''}
    ${flow}
  return ${ret}
}`
  }
}
