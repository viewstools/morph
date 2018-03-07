export default ({ state, name }) => {
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

  const composeSpring = (animation, index) => {
    // TODO non spring animations ??
    return `
    if (props.${animation.scope} !== next.${animation.scope}) {
      Animated.spring(this.animatedValue${index}, {
        toValue: next.${animation.scope} ? 1 : 0,
        stiffness: ${animation.stiffness},
        damping: ${animation.damping},
        delay: ${animation.delay}
      }).start()
    }`
  }

  const composeValues = (animation, index) =>
    `animatedValue${index} = new Animated.Value(this.props.${animation.scope} ? 1 : 0)
    `

  const maybeAnimated =
    state.isAnimated || state.hasAnimatedChild
      ? `${state.animations
          .map((animation, index) => composeValues(animation, index))
          .join('')}
      componentWillReceiveProps(next) {
          const { props } = this
          ${state.animations
            .map((animation, index) => composeSpring(animation, index))
            .join('')}
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
