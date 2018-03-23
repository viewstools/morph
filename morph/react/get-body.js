export default ({ state, name }) => {
  let render = state.render.join('')
  if (Object.keys(state.locals).length > 0 || state.hasFormattedChild) {
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

  if (maybeState || maybeTracking) {
    return `class ${name} extends React.Component {
  ${maybeState}

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
