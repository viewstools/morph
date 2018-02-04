const stringify = prop =>
  /^[0-9]+$/.test(prop.defaultValue)
    ? prop.defaultValue
    : JSON.stringify(prop.defaultValue)

export default ({ state, name }) => {
  const props = state.props
    .filter(prop => prop.defaultValue !== false)
    .map(prop => `${prop.name}: ${stringify(prop)}`)

  return props.length === 0
    ? ''
    : `${name}.defaultProps = {${props.join(',\n')}}`
}
