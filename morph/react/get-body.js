export default ({ state, name }) => {
  const render = state.render.join('')
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
    const { props, state } = this
    ${maybeChildrenArray}
    return (${render})
  }
}`
  } else {
    return `const ${name} = props => {
  ${maybeChildrenArray}
  return (${render})
}`
  }
}
