export default ({ state, name }) => {
  const render = state.render.join('')
  const hasContext = state.debug

  return state.captures.length > 0
    ? `class ${name} extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { ${hasContext ? 'context, ' : ''}props, state } = this
    return (${render})
  }
}`
    : `const ${name} = (props${hasContext ? ', context' : ''}) => (${render})`
}
