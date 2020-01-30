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

          toValue.push(`${JSON.stringify(prop.name)}: ${value}`)
          fromValue.push(
            `${JSON.stringify(prop.name)}: ${JSON.stringify(
              prop.scopes[0].value
            )}`
          )
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
  if (
    state.useFlow ||
    (state.flow === 'separate' && state.uses.includes('ViewsUseFlow'))
  ) {
    flow.push(`let flow = fromFlow.useFlow()`)
  }
  if (state.setFlowTo) {
    flow.push(`let setFlowTo = fromFlow.useSetFlowTo()`)
  }
  let data = []
  if (state.data) {
    switch (state.data.type) {
      case 'show':
      case 'capture': {
        data.push(`let data = fromData.useData({ path: '${state.data.path}', `)
        maybeDataContext(state.data, data)
        maybeDataFormat(state.dataFormat, data)
        maybeDataValidate(state.dataValidate, data)
        data.push('})')
        break
      }

      default: {
        break
      }
    }
  }

  if (state.hasRefs) {
    let trackOpen = state.track ? '<TrackContext.Consumer>{track => (' : ''
    let trackClose = state.track ? ')}</TrackContext.Consumer>' : ''
    return `export default class ${name} extends React.Component {
  render() {
    let { props } = this
    return (${trackOpen}${render}${trackClose})
  }
}`
  } else {
    let ret = render ? `(${render})` : null

    return `export default function ${name}(props) {
    ${state.track ? `let track = React.useContext(TrackContext)` : ''}
    ${state.useIsBefore ? 'let isBefore = useIsBefore()' : ''}
    ${state.useIsMedia ? 'let isMedia = useIsMedia()' : ''}
    ${animated.join('\n')}
    ${flow.join('\n')}
    ${data.join('\n')}

  return ${ret}
}`
  }
}

function maybeDataContext(dataDefinition, data) {
  if (dataDefinition.context === null) return

  data.push(`context: '${dataDefinition.context}',`)
}
function maybeDataFormat(format, data) {
  if (!format) return

  if (format.formatIn) {
    data.push(`formatIn: '${format.formatIn}',`)
  }

  if (format.formatOut) {
    data.push(`formatOut: '${format.formatOut}',`)
  }
}
function maybeDataValidate(validate, data) {
  if (!validate || validate.type !== 'js') return
  data.push(`validate: '${validate.value}',`)
  if (validate.required) {
    data.push('validateRequired: true,')
  }
}
