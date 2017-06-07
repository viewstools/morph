import wrap from './wrap.js'

export default ({ state, name }) => {
  if (Object.keys(state.remap).length === 0) return false
  const remap = {
    name: `Remap${name}`,
  }

  const localState = []
  const fns = []
  const methods = Object.keys(state.remap).map(prop => {
    localState.push(`${prop}: props.${prop},`)
    const { body, fn } = state.remap[prop]
    fns.push(`${fn}={this.${fn}}`)
    return body
  })

  remap.component = `class ${remap.name} extends React.Component {
constructor(props) {
super(props)
this.state = ${wrap(localState.join('\n'))}
}
${methods.join('\n')}

render() {
  return <${name} {...this.props} {...this.state} ${fns.join(' ')} />
}
}`

  return remap
}
