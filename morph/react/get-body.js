export default ({ state, name }) => {
  const render = state.render.join('')
  const hasContext = state.debug
  const maybeChildrenArray = state.usesChildrenArray
    ? `const childrenArray = React.Children.toArray(props.children)`
    : ''

  if (state.captures.length > 0) {
    return `class ${name} extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { ${hasContext ? 'context, ' : ''}props, state } = this
    ${maybeChildrenArray}
    return (${render})
  }
}`
  } else {
    return `const ${name} = (props${hasContext ? ', context' : ''}) => {
  ${maybeChildrenArray}
  return (${render})
}`
  }
}
