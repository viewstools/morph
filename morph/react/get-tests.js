export default ({ state, name }) => {
  if (!state.tests) return false

  const tests = {
    name: `Tests${name}`,
  }

  tests.component = `class ${tests.name} extends React.Component {
  constructor(props) {
    super(props)

    this.display = this.display.bind(this)
    this.tests = fromTests.make(this.display)

    this.state = {
      active: props.test,
      data: this.tests[props.test] || this.tests[this.tests._main],
    }
  }

  display(data, active) {
    this.setState({
      active,
      data,
    }, () => {
      if (typeof this.props.onInteraction === 'function') {
        this.props.onInteraction()
      }
    })
  }

  componentWillReceiveProps(next) {
    if (this.state.active !== next.test) {
      this.setState({
        active: next.test,
        data: this.tests[next.test],
      })
    }
  }

  render() {
    const { props, state } = this
    return (
      <${name}
        width={props.width}
        height={props.height}
        {...state.data}
        {...clean(props)}
      />
    )
  }
}
function clean(props) {
  const ret = {}
  Object.keys(props)
    .filter(prop => prop !== 'height' && prop !== 'width' && prop !== 'test')
    .forEach(prop => ret[prop] = props[prop])
  return ret
}
${tests.name}.tests = fromTests.names`

  return tests
}
