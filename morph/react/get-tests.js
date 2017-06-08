export default ({ state, name }) => {
  if (!state.tests) return false

  const tests = {
    name: `Tests${name}`,
  }

  tests.component = `class ${tests.name} extends React.Component {
  constructor(props) {
    super(props)
    this.tests = makeTests(this.display)
    this.state = this.tests[this.tests._main]
  }

  display = next => this.setState(next)

  render() {
    return <${name} {...this.state} {...this.props} />
  }
}`

  return tests
}
