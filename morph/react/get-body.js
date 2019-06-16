import getUnit from '../get-unit.js'

export default ({ state, name }) => {
  let render = state.render.join('')
  if (Object.keys(state.locals).length > 0 || state.isFormatted) {
    render = `<Subscribe to={[LocalContainer]}>\n{local =>\n${render}\n}</Subscribe>`
  }

  let animated = []
  if (state.isAnimated) {
    Object.keys(state.animations).forEach(blockId => {
      Object.values(state.animations[blockId]).forEach(item => {
        let { curve, ...configValues } = item.animation.properties

        if (!state.isReactNative && curve !== 'spring') return

        let spring = ['{', '"config": {']
        Object.entries(configValues).forEach(([k, v]) => {
          spring.push(`${k}: ${JSON.stringify(v)},`)
        })

        if (curve !== 'spring' && curve !== 'linear') {
          spring.push(`"easing": Easing.${curve.replace('ease', 'easeCubic')},`)
        }
        spring.push('},')

        let toValue = []
        let fromValue = []
        Object.values(item.props).forEach(prop => {
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

          toValue.push(`${JSON.stringify(prop.name)}: ${value}`)

          let firstScopeValue = JSON.stringify(prop.scopes[0].value)
          if (!state.isReactNative && unit) {
            firstScopeValue = `\`$\{${firstScopeValue}}${unit}\``
          }
          fromValue.push(`${JSON.stringify(prop.name)}: ${firstScopeValue}`)
        })

        spring.push(`"from": {${fromValue.join(',')}},`)
        spring.push(`"to": {${toValue.join(',')}},`)
        spring.push('}')

        animated.push(
          `let animated${blockId}${
            item.index > 0 ? item.index : ''
          } = useSpring(${spring.join('\n')})`
        )
      })
    })
  }

  let flow = []
  if (state.flow === 'separate') {
    flow.push(`let flow = fromFlow.useFlow()`)
  }
  if (state.setFlow) {
    flow.push(`let setFlow = fromFlow.useSetFlow()`)
  }

  if (state.hasRefs) {
    let trackOpen = state.track ? '<TrackContext.Consumer>{track => (' : ''
    let trackClose = state.track ? ')}</TrackContext.Consumer>' : ''
    return `class ${name} extends React.Component {
  render() {
    let { props } = this
    return (${trackOpen}${render}${trackClose})
  }
}`
  } else {
    let ret = render ? `(${render})` : null

    return `let ${name} = (props) => {
    ${state.track ? `let track = React.useContext(TrackContext)` : ''}
    ${state.useIsBefore ? 'let isBefore = useIsBefore()' : ''}
    ${state.useIsMedia ? 'let isMedia = useIsMedia()' : ''}
    ${animated.join('\n')}
    ${flow.join('\n')}

  return ${ret}
}`
  }
}
