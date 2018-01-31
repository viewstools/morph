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

  if (maybeState || maybeTracking) {
    return `class ${name} extends React.Component {
  ${maybeState}
  ${maybeTracking}

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
