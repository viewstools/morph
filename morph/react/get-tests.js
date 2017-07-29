export default ({ state, name }) => {
  if (!state.tests) return false

  const tests = {
    name: `Tests${name}`,
  }

  // TODO track choices in sessionStorage
  tests.component = `
  class ${tests.name} extends React.Component {
  constructor(props) {
    super(props)

    this.display = this.display.bind(this)
    this.on = this.on.bind(this)
    this.off = this.off.bind(this)

    const made = makeTests(this.display)
    this.state = Object.assign({}, made[made._main], { _on: true })

    const tests = {
      active: made._main,
      on: this.on,
      off: this.off,
    }

    Object.keys(made).filter(m => m !== '_main').forEach(test => {
      tests[test] = () => this.display(made[test], test)
    })

    this.tests = tests
  }

  display(next, name) {
    this.setState(Object.assign({}, next, { _on: true }))
  }

  off() {
    this.setState({ _on: false })
  }

  on() {
    this.setState({ _on: true })
  }

  render() {
    const { props, state } = this
    return state._on ? <${name} {...props} {...state} /> : <${name} {...props} />
  }
}`

  return tests
}
