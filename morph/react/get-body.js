import getUnit from '../get-unit.js'
import { maskFormats } from '../utils.js'

export default ({ state, name }) => {
  let render = state.render.join('')
  if (Object.keys(state.locals).length > 0 || state.isFormatted) {
    render = `<Subscribe to={[LocalContainer]}>\n{local =>\n${render}\n}</Subscribe>`
  }

  const maybeChildrenArray = state.usesChildrenArray
    ? `const childrenArray = React.Children.toArray(props.children)`
    : ''

  let animatedOpen = []
  let animatedClose = []
  if (state.isAnimated) {
    Object.keys(state.animations).forEach(blockId => {
      Object.values(state.animations[blockId]).forEach(item => {
        const { curve, ...configValues } = item.animation.properties

        if (!state.isReactNative && curve !== 'spring') return

        let config = `config={${JSON.stringify(configValues)}}`

        if (curve !== 'spring' && curve !== 'linear') {
          config = `easing={Easing.${curve.replace(
            'ease',
            'easeCubic'
          )}} ${config}`
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

        animatedOpen.push(
          `<Spring native ${config} to={{${to}}}>{animated${blockId}${
            item.index > 0 ? item.index : ''
          } => (`
        )

        animatedClose.push(`)}</Spring>`)
      })
    })
  }

  const addCaptureMasks = () => {
    let masks = ''
    if (Object.values(state.captureMasks).includes(maskFormats.dollar)) {
      masks += `const numberMask = createNumberMask({
        prefix: '$',
        allowDecimal: true,
      })
      `
    }

    masks += Object.keys(state.captureMasks)
      .map(
        key =>
          `let input${key} = useRef(null)
    let onChange${key} = useMaskedInput({
      input: input${key},
      mask: ${state.captureMasks[key]},
      onChange: props.onChange${key},
      showMask: true,
    })`
      )
      .join('; \n\n')

    return masks
  }

  if (state.hasRefs || state.isAnimated) {
    animatedOpen = animatedOpen.join('')
    animatedClose = animatedClose.reverse().join('')

    let trackOpen = state.track ? '<TrackContext.Consumer>{track => (' : ''
    let trackClose = state.track ? ')}</TrackContext.Consumer>' : ''
    return `class ${name} extends React.Component {
  render() {
    const { props } = this
    ${Object.keys(state.captureMasks).length > 0 ? addCaptureMasks() : ''}
    ${maybeChildrenArray}
    return (${trackOpen}${animatedOpen}${render}${animatedClose}${trackClose})
  }
}`
  } else {
    return `const ${name} = (props) => {
    ${state.track ? `const track = React.useContext(TrackContext)` : ''}
    ${Object.keys(state.captureMasks).length > 0 ? addCaptureMasks() : ''}
  ${maybeChildrenArray}
  return (${render})
}`
  }
}
