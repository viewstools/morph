export default ({ code, captures, name }) =>
  captures.length > 0
    ? `class ${name} extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { props, state } = this
    return (${code})
  }
}`
    : `const ${name} = props => (${code})`
