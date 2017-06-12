export default ({ state, name }) => {
  if (!state.tests) return false

  const tests = {
    name: `Tests${name}`,
  }

  // TODO track choices in sessionStorage
  tests.component = `
  const g = typeof window === 'undefined' ? global : window

  class ${tests.name} extends React.Component {
  constructor(props) {
    super(props)

    const { _main, ...rest } = makeTests(this.display)
    this.state = {
      ...rest[_main],
      _on: true,
    }

    const tests = {
      active: _main,
      on: this.on,
      off: this.off,
    }

    Object.keys(rest).forEach(test => {
      tests[test] = () => this.display(rest[test], test)
    })

    if (typeof g.tests === 'undefined') {
      const validTests = k => !(k === 'off' || k === 'on')
      g.tests = {
        off: () => Object.keys(g.tests).filter(validTests).forEach(t => g.tests[t].off()),
        on: () => Object.keys(g.tests).filter(validTests).forEach(t => g.tests[t].on()),
      }
    }

    if (typeof g.tests.${name} === 'undefined') {
      g.tests.${name} = tests
    } else if (Array.isArray(g.tests.${name})) {
      g.tests.${name}.push(tests)
    } else {
      g.tests.${name} = [
        g.tests.${name},
        tests
      ]
      g.tests.${name}.off = () => g.tests.${name}.forEach(t => t.off())
      g.tests.${name}.on = () => g.tests.${name}.forEach(t => t.on())
    }

    this.test = tests

    console.info('${name} tests 👉', g.tests)
  }

  componentWillUnmount() {
    if (Array.isArray(g.tests.${name})) {
      g.tests.${name} = g.tests.${name}.filter(t => t === this.tests)
      if (g.tests.${name}.length === 0) {
        delete g.tests.${name}
      }
    } else {
      delete g.tests.${name}
    }
  }

  display = (next, name) => {
    this.setState(next, () => {
      g.tests.${name}.active = name
    })
  }

  off = () => this.setState({ _on: false })
  on = () => this.setState({ _on: true })

  render() {
    const { _on, ...state } = this.state
    return _on ? <${name} {...this.props} {...state} /> : <${name} {...this.props} />
  }
}`

  return tests
}
