import { canUseNativeDriver, getScopeIndex, isNewScope } from '../utils.js'

export default ({ state, name }) => {
  let render = state.render.join('')
  if (Object.keys(state.locals).length > 0 || state.isFormatted) {
    render = `<Subscribe to={[LocalContainer]}>\n{local =>\n${render}\n}</Subscribe>`
  }

  const maybeChildrenArray = state.usesChildrenArray
    ? `const childrenArray = React.Children.toArray(props.children)`
    : ''

  const maybeState =
    state.captures.length > 0
      ? `constructor(props) {
    super(props)
    this.state = {}
  }`
      : ''

  const maybeTracking = state.track && !state.debug

  const composeAnimation = (state, animation, index) => {
    if (animation.curve === 'spring') {
      return composeSpring(animation, index)
    } else if (state.isReactNative) {
      return composeTiming(animation, index)
    }
  }

  const composeSpring = (animation, index) =>
    `if (props.${animation.scope} !== prev.${animation.scope}) {
      Animated.spring(this.animatedValue${index}, {
        toValue: props.${animation.scope} ? 1 : 0,
        speed: ${animation.speed},
        bounciness: ${animation.bounciness},
        delay: ${animation.delay},
        useNativeDriver: ${canUseNativeDriver(animation)}
      }).start()
    }`

  const composeTiming = (animation, index) =>
    `if (props.${animation.scope} !== prev.${animation.scope}) {
      Animated.timing(this.animatedValue${index}, {
        toValue: props.${animation.scope} ? 1 : 0,
        duration: ${animation.duration},
        delay: ${animation.delay},
        useNativeDriver: ${canUseNativeDriver(animation)}
      }).start()
    }`

  const composeValues = (state, animation, index) => {
    if (animation.curve === 'timing' && !state.isReactNative) return
    return `animatedValue${index} = new Animated.Value(this.props.${
      animation.scope
    } ? 1 : 0)
    `
  }

  const maybeAnimated =
    state.isAnimated || state.hasAnimatedChild
      ? `${state.animations
          .map((animation, index) => {
            return isNewScope(state, animation, index)
              ? composeValues(
                  state,
                  animation,
                  getScopeIndex(state, animation.scope)
                )
              : ''
          })
          .join('')}
      componentDidUpdate(prev) {
          const { props } = this
          ${state.animations
            .map(animation =>
              composeAnimation(
                state,
                animation,
                getScopeIndex(state, animation.scope)
              )
            )
            .join('')}
        }`
      : ''

  if (maybeState || maybeTracking || maybeAnimated) {
    return `class ${name} extends React.Component {
  ${maybeState}
  ${maybeAnimated}

  render() {
    const { ${maybeTracking ? 'context,' : ''} props, ${
      maybeState ? 'state' : ''
    } } = this
    ${maybeChildrenArray}
    return (${render})
  }
}`
  } else {
    return `const ${name} = (props ${maybeTracking ? ', context' : ''}) => {
  ${maybeChildrenArray}
  return (${render})
}`
  }
}
