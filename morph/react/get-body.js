export default ({ state, name }) => {
  const render = state.render.join('')
  return state.captures.length > 0
    ? `class ${name} extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { context, props, state } = this
    return (${render})
  }
}`
    : `const ${name} = (props, context) => (${render})`
}
