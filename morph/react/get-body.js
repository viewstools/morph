export default ({ state, name }) => {
  debugger
  const render = state.render.join('')
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

  const block = `this.props["${state.testIdKey}"] || "${state.name}"`
  const maybeTracking =
    state.track && !state.debug
      ? `componentDidMount() {
  this.context.track({ block: ${block}, action: "enter" })
}

componentWillUnmount() {
  this.context.track({ block: ${block}, action: "leave" })
}`
      : ''

  // TODO: what if we have multiple animations on differen scopes?
  const maybeAnimated =
    state.isAnimated || state.hasAnimatedChild
      ? `animatedValue = new Animated.Value(this.props.${state.animation
          .scope} ? 1 : 0)
      
      componentWillReceiveProps(next) {
    const { props } = this
    if (props.${state.animation.scope} !== next.${state.animation.scope}) {
      Animated.spring(this.animatedValue, {
        toValue: next.${state.animation.scope} ? 1 : 0,
        stiffness: ${state.animation.stiffness},
        damping: ${state.animation.damping},
        delay: ${state.animation.delay}
      }).start()
    }
  }`
      : ''

  if (maybeState || maybeTracking || maybeAnimated) {
    return `class ${name} extends React.Component {
  ${maybeState}
  ${maybeTracking}
  ${maybeAnimated}

  render() {
    const { ${maybeTracking ? 'context,' : ''} props, ${maybeState
      ? 'state'
      : ''} } = this
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
