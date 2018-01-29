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
  const maybeTracking = state.track
    ? `componentDidMount() {
  this.context.track({ block: ${block}, action: "enter" })
}

componentWillUnmount() {
  this.context.track({ block: ${block}, action: "leave" })
}`
    : ''

  if (maybeState || state.track) {
    return `class ${name} extends React.Component {
  ${maybeState}
  ${maybeTracking}

  render() {
    const { ${state.track ? 'context,' : ''} props, ${
      maybeState ? 'state' : ''
    } } = this
    ${maybeChildrenArray}
    return (${render})
  }
}`
  } else {
    return `const ${name} = (props ${state.track ? ', context' : ''}) => {
  ${maybeChildrenArray}
  return (${render})
}`
  }
}
